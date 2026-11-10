"""
train.py
--------
Trains SimpleDetector on ONE (or several combined) source generator(s).
"""

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, ConcatDataset


def train_detector(model, train_datasets, device, epochs=8, batch_size=16, lr=1e-3, verbose=True):
    """
    train_datasets: list of DeepfakeDataset objects (source generator(s))
    """
    dataset = ConcatDataset(train_datasets) if len(train_datasets) > 1 else train_datasets[0]
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=True, num_workers=0)

    model.to(device)
    model.train()
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    criterion = nn.CrossEntropyLoss()

    history = []
    for epoch in range(epochs):
        total_loss, total_correct, total_n = 0.0, 0, 0
        for imgs, labels, _paths in loader:
            imgs, labels = imgs.to(device), labels.to(device)
            optimizer.zero_grad()
            logits = model(imgs)
            loss = criterion(logits, labels)
            loss.backward()
            optimizer.step()

            total_loss += loss.item() * imgs.size(0)
            total_correct += (logits.argmax(1) == labels).sum().item()
            total_n += imgs.size(0)

        epoch_loss = total_loss / total_n
        epoch_acc = total_correct / total_n
        history.append({"epoch": epoch + 1, "loss": epoch_loss, "train_acc": epoch_acc})
        if verbose:
            print(f"  epoch {epoch+1}/{epochs}  loss={epoch_loss:.4f}  train_acc={epoch_acc:.3f}")

    return history
