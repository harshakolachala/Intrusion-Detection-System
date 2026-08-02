from federated.predict import Predictor

predictor = Predictor()

sample = [0.0] * 78

result = predictor.predict(sample)

print(result)