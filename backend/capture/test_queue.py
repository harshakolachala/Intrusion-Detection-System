from queue_manager import packet_queue

packet_queue.enqueue({"packet": 1})

packet_queue.enqueue({"packet": 2})

print(packet_queue.size())

print(packet_queue.dequeue())

print(packet_queue.dequeue())

print(packet_queue.size())