import pickle


def serialize(item, file):
    if not file:
        return pickle.dumps(item)
    with open(file, "wb") as file:
        pickle.dump(item, file)


def deserialize(item, file):
    if not file:
        return pickle.loads(item)
    with open(file, "rb") as file:
        return pickle.load(file)
