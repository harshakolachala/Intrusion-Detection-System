"""
Thread-safe packet queue.
"""

from queue import Queue, Empty


class PacketQueue:

    def __init__(self, max_size: int = 10000):

        self.queue = Queue(maxsize=max_size)

    def enqueue(self, packet):

        self.queue.put(packet)

    def dequeue(self):

        try:
            return self.queue.get_nowait()

        except Empty:
            return None

    def size(self):

        return self.queue.qsize()

    def clear(self):

        while not self.queue.empty():
            self.queue.get()


packet_queue = PacketQueue()