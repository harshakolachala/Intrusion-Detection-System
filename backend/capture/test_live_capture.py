import time

from capture.packet_capture import capture_engine

print("\nAvailable Interfaces:\n")

interfaces = capture_engine.get_interfaces()

for i, interface in enumerate(interfaces):

    print(f"{i} -> {interface}")

choice = int(input("\nSelect Interface Number: "))

capture_engine.set_interface(

    interfaces[choice]

)

capture_engine.start_capture()

print("\nCapturing for 20 seconds...\n")

time.sleep(20)

print(capture_engine.statistics())