from database import SessionLocal  # Add this import
import models                      # Add this import

# ... inside your @router.post("/") predict function, right before the 'return' statement:

    # Save the detection to the database
db = SessionLocal()
try:
    new_alert = models.Alert(
        attack_type=str(prediction_label),
        confidence=float(confidence),
        source_ip="192.168.1.105"  # Simulated source IP
        )
    db.add(new_alert)
    db.commit()
finally:
        db.close()
