export type WebSocketEvent = {
  event: string;
  timestamp?: string;
  data?: Record<string, unknown>;
};

type EventHandler = (event: WebSocketEvent) => void;

export type WebSocketStatus =
  | "connecting"
  | "connected"
  | "disconnected";

type StatusHandler = (
  status: WebSocketStatus
) => void;

class SentinelWebSocket {
  private socket: WebSocket | null = null;

  private handlers: EventHandler[] = [];

  private statusHandlers: StatusHandler[] = [];

  private status: WebSocketStatus =
    "disconnected";

  private reconnectTimer: number | null = null;

  private disconnectTimer: number | null = null;

  private reconnectAttempts = 0;

  private manuallyDisconnected = false;

  private connecting = false;

  private readonly url =
    "ws://127.0.0.1:8000/ws/events";

  // =========================================================
  // STATUS NOTIFICATION
  // =========================================================

  private notifyStatus(
    status: WebSocketStatus
  ) {
    this.status = status;

    const handlers = [
      ...this.statusHandlers,
    ];

    handlers.forEach((handler) => {
      try {
        handler(status);
      } catch (error) {
        console.error(
          "[SentinelAI] WebSocket status handler error:",
          error
        );
      }
    });
  }

  // =========================================================
  // CONNECT
  // =========================================================

  connect() {
    this.manuallyDisconnected = false;

    // Cancel pending deferred disconnect.
    if (this.disconnectTimer !== null) {
      window.clearTimeout(
        this.disconnectTimer
      );

      this.disconnectTimer = null;

      console.log(
        "[SentinelAI] Pending WebSocket disconnect cancelled."
      );
    }

    // Cancel pending reconnect.
    if (this.reconnectTimer !== null) {
      window.clearTimeout(
        this.reconnectTimer
      );

      this.reconnectTimer = null;
    }

    // Existing connection is already open.
    if (
      this.socket &&
      this.socket.readyState ===
        WebSocket.OPEN
    ) {
      this.notifyStatus("connected");

      this.emitEvent({
        event: "connection",
        timestamp:
          new Date().toISOString(),
        data: {
          status: "connected",
          message:
            "SentinelAI real-time event stream connected.",
        },
      });

      return;
    }

    // Existing connection is still negotiating.
    if (
      this.socket &&
      this.socket.readyState ===
        WebSocket.CONNECTING
    ) {
      this.notifyStatus("connecting");

      return;
    }

    if (this.connecting) {
      this.notifyStatus("connecting");

      return;
    }

    this.connecting = true;

    this.notifyStatus("connecting");

    console.log(
      "[SentinelAI] Connecting to WebSocket..."
    );

    let socket: WebSocket;

    try {
      socket = new WebSocket(
        this.url
      );
    } catch (error) {
      this.connecting = false;

      this.notifyStatus(
        "disconnected"
      );

      console.error(
        "[SentinelAI] Failed to create WebSocket:",
        error
      );

      this.emitEvent({
        event: "connection_error",
        timestamp:
          new Date().toISOString(),
        data: {
          status: "error",
          message:
            "Unable to create WebSocket connection.",
        },
      });

      this.scheduleReconnect();

      return;
    }

    this.socket = socket;

    // =======================================================
    // OPEN
    // =======================================================

    socket.onopen = () => {
      // Ignore stale socket.
      if (this.socket !== socket) {
        try {
          socket.close();
        } catch {
          // Ignore stale socket errors.
        }

        return;
      }

      this.connecting = false;

      this.reconnectAttempts = 0;

      this.notifyStatus("connected");

      console.log(
        "[SentinelAI] WebSocket connected."
      );

      this.emitEvent({
        event: "connection",
        timestamp:
          new Date().toISOString(),
        data: {
          status: "connected",
          message:
            "SentinelAI real-time event stream connected.",
        },
      });
    };

    // =======================================================
    // MESSAGE
    // =======================================================

    socket.onmessage = (
      message
    ) => {
      try {
        let parsed: unknown;

        if (
          typeof message.data ===
          "string"
        ) {
          parsed = JSON.parse(
            message.data
          );
        } else {
          console.warn(
            "[SentinelAI] Unsupported WebSocket message type."
          );

          return;
        }

        if (
          !parsed ||
          typeof parsed !==
            "object"
        ) {
          console.warn(
            "[SentinelAI] WebSocket message is not an object."
          );

          return;
        }

        const event =
          parsed as WebSocketEvent;

        if (
          typeof event.event !==
          "string"
        ) {
          console.warn(
            "[SentinelAI] WebSocket message has no valid event name:",
            event
          );

          return;
        }

        console.log(
          "[SentinelAI] WebSocket event:",
          event
        );

        this.emitEvent(event);
      } catch (error) {
        console.error(
          "[SentinelAI] Invalid WebSocket message:",
          error
        );
      }
    };

    // =======================================================
    // ERROR
    // =======================================================

    socket.onerror = (
      error
    ) => {
      console.error(
        "[SentinelAI] WebSocket error:",
        {
          error,
          readyState:
            socket.readyState,
          url: this.url,
        }
      );

      /*
       * Do not reconnect here.
       *
       * Browser normally fires onclose after onerror.
       * onclose owns the reconnect lifecycle.
       */

      this.emitEvent({
        event: "connection_error",
        timestamp:
          new Date().toISOString(),
        data: {
          status: "error",
          message:
            "SentinelAI real-time connection error.",
        },
      });
    };

    // =======================================================
    // CLOSE
    // =======================================================

    socket.onclose = (
      event
    ) => {
      /*
       * Ignore events from stale sockets.
       */
      if (
        this.socket !== socket
      ) {
        return;
      }

      this.socket = null;

      this.connecting = false;

      this.notifyStatus(
        "disconnected"
      );

      console.warn(
        "[SentinelAI] WebSocket disconnected.",
        {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        }
      );

      this.emitEvent({
        event: "disconnected",
        timestamp:
          new Date().toISOString(),
        data: {
          status: "disconnected",
          message:
            "SentinelAI real-time event stream disconnected.",
          code: event.code,
          reason: event.reason,
        },
      });

      /*
       * Reconnect unless the application intentionally
       * disconnected.
       */
      if (
        !this.manuallyDisconnected
      ) {
        this.scheduleReconnect();
      }
    };
  }

  // =========================================================
  // DISCONNECT
  // =========================================================

  disconnect() {
    /*
     * Mark connection as intentionally disconnected.
     *
     * A subsequent connect() can immediately reverse this.
     */
    this.manuallyDisconnected = true;

    /*
     * Cancel scheduled reconnect.
     */
    if (
      this.reconnectTimer !== null
    ) {
      window.clearTimeout(
        this.reconnectTimer
      );

      this.reconnectTimer = null;
    }

    /*
     * React Strict Mode protection.
     *
     * Do not immediately close the socket.
     */
    if (
      this.disconnectTimer !== null
    ) {
      return;
    }

    this.disconnectTimer =
      window.setTimeout(() => {
        this.disconnectTimer =
          null;

        /*
         * connect() was called again before the deferred
         * disconnect executed.
         */
        if (
          !this.manuallyDisconnected
        ) {
          return;
        }

        const socket =
          this.socket;

        this.socket = null;

        this.connecting = false;

        if (
          socket &&
          (
            socket.readyState ===
              WebSocket.OPEN ||
            socket.readyState ===
              WebSocket.CONNECTING
          )
        ) {
          try {
            socket.close(
              1000,
              "Application disconnect"
            );
          } catch {
            // Ignore close errors.
          }
        }

        this.notifyStatus(
          "disconnected"
        );

        this.emitEvent({
          event: "disconnected",
          timestamp:
            new Date().toISOString(),
          data: {
            status:
              "disconnected",
            message:
              "SentinelAI real-time event stream stopped.",
          },
        });

        console.log(
          "[SentinelAI] WebSocket connection closed."
        );
      }, 0);
  }

  // =========================================================
  // EVENT SUBSCRIBE
  // =========================================================

  subscribe(
    handler: EventHandler
  ) {
    /*
     * Avoid duplicate subscriptions.
     */
    if (
      !this.handlers.includes(
        handler
      )
    ) {
      this.handlers.push(
        handler
      );
    }

    /*
     * IMPORTANT:
     *
     * If Dashboard subscribes after the WebSocket is already
     * connected, immediately provide a connection event.
     */
    if (
      this.socket?.readyState ===
      WebSocket.OPEN
    ) {
      try {
        handler({
          event: "connection",
          timestamp:
            new Date().toISOString(),
          data: {
            status: "connected",
            message:
              "SentinelAI real-time event stream connected.",
          },
        });
      } catch (error) {
        console.error(
          "[SentinelAI] Initial subscription notification error:",
          error
        );
      }
    }

    return () => {
      this.handlers =
        this.handlers.filter(
          (item) =>
            item !== handler
        );
    };
  }

  // =========================================================
  // STATUS SUBSCRIBE
  // =========================================================

  subscribeStatus(
    handler: StatusHandler
  ) {
    /*
     * Avoid duplicate status subscriptions.
     */
    if (
      !this.statusHandlers.includes(
        handler
      )
    ) {
      this.statusHandlers.push(
        handler
      );
    }

    /*
     * IMPORTANT:
     *
     * Immediately provide the current status.
     *
     * This prevents Dashboard from staying on
     * "Connecting Telemetry" when the WebSocket was
     * already connected before Dashboard subscribed.
     */
    try {
      handler(this.status);
    } catch (error) {
      console.error(
        "[SentinelAI] Initial WebSocket status notification error:",
        error
      );
    }

    return () => {
      this.statusHandlers =
        this.statusHandlers.filter(
          (item) =>
            item !== handler
        );
    };
  }

  // =========================================================
  // CONNECTION STATUS
  // =========================================================

  isConnected() {
    return (
      this.socket?.readyState ===
      WebSocket.OPEN
    );
  }

  // =========================================================
  // IS CONNECTING
  // =========================================================

  isConnecting() {
    return (
      this.socket?.readyState ===
        WebSocket.CONNECTING ||
      this.connecting
    );
  }

  // =========================================================
  // STATUS
  // =========================================================

  getStatus(): WebSocketStatus {
    if (
      this.socket?.readyState ===
      WebSocket.OPEN
    ) {
      return "connected";
    }

    if (
      this.socket?.readyState ===
        WebSocket.CONNECTING ||
      this.connecting
    ) {
      return "connecting";
    }

    return this.status;
  }

  // =========================================================
  // INTERNAL EVENT EMITTER
  // =========================================================

  private emitEvent(
    event: WebSocketEvent
  ) {
    const handlers = [
      ...this.handlers,
    ];

    handlers.forEach(
      (handler) => {
        try {
          handler(event);
        } catch (error) {
          console.error(
            "[SentinelAI] WebSocket event handler error:",
            error
          );
        }
      }
    );
  }

  // =========================================================
  // RECONNECT
  // =========================================================

  private scheduleReconnect() {
    if (
      this.reconnectTimer !== null
    ) {
      return;
    }

    if (
      this.manuallyDisconnected
    ) {
      return;
    }

    const delay =
      Math.min(
        1000 *
          Math.pow(
            2,
            this.reconnectAttempts
          ),
        10000
      );

    this.reconnectAttempts += 1;

    console.log(
      `[SentinelAI] Reconnecting in ${delay}ms...`
    );

    this.reconnectTimer =
      window.setTimeout(() => {
        this.reconnectTimer =
          null;

        if (
          !this.manuallyDisconnected
        ) {
          this.connect();
        }
      }, delay);
  }
}

export const websocketService =
  new SentinelWebSocket();