#!/bin/bash

echo "Waiting for Kafka..."

until kafka-topics --bootstrap-server kafka:29092 --list >/dev/null 2>&1; do
  echo "Kafka is not ready yet..."
  sleep 5
done

echo "Kafka is ready! Creating/updating topics..."

# Create or update accounting.accounts
if kafka-topics --bootstrap-server kafka:29092 --list | grep -q "^accounting.accounts$"; then
  echo "Topic 'accounting.accounts' exists."
  current_partitions=$(kafka-topics --bootstrap-server kafka:29092 --describe --topic accounting.accounts | grep "PartitionCount" | awk '{print $4}')
  if [ "$current_partitions" -lt 1 ]; then
    echo "Increasing partitions from $current_partitions to 1"
    kafka-topics --bootstrap-server kafka:29092 --alter --topic accounting.accounts --partitions 1
  fi
else
  echo "Creating topic 'accounting.accounts'"
  kafka-topics --create --bootstrap-server kafka:29092 --replication-factor 1 --partitions 1 --topic accounting.accounts
fi

# Create or update accounting.payments
if kafka-topics --bootstrap-server kafka:29092 --list | grep -q "^accounting.payments$"; then
  echo "Topic 'accounting.payments' exists."
  current_partitions=$(kafka-topics --bootstrap-server kafka:29092 --describe --topic accounting.payments | grep "PartitionCount" | awk '{print $4}')
  if [ "$current_partitions" -lt "$PAYMENT_CONSUMERS_AMOUNT" ]; then
    echo "Increasing partitions from $current_partitions to $PAYMENT_CONSUMERS_AMOUNT"
    kafka-topics --bootstrap-server kafka:29092 --alter --topic accounting.payments --partitions "$PAYMENT_CONSUMERS_AMOUNT"
  fi
else
  echo "Creating topic 'accounting.payments' with $PAYMENT_CONSUMERS_AMOUNT partitions"
  kafka-topics --create --bootstrap-server kafka:29092 --replication-factor 1 --partitions "$PAYMENT_CONSUMERS_AMOUNT" --topic accounting.payments
fi

echo "Topics processed successfully!"