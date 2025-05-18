// lib/mqtt/client.ts
import mqtt, { MqttClient, IClientOptions } from 'mqtt';

let mqttClient: MqttClient | null = null;

export function connectMQTT(): MqttClient {
  if (mqttClient) return mqttClient;

  const brokerUrl: string = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
  const options: IClientOptions = {
    clientId: `library-system-${Math.random().toString(16).substring(2, 10)}`,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    clean: true,
    reconnectPeriod: 1000,
  };

  mqttClient = mqtt.connect(brokerUrl, options);

  mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    mqttClient!.subscribe('library/locker/status/#');
    mqttClient!.subscribe('library/locker/response/#');
  });

  mqttClient.on('error', (err) => {
    console.error('MQTT connection error:', err);
    mqttClient = null;
  });

  mqttClient.on('message', (topic: string, message: Buffer) => {
    const msg = message.toString();
    console.log(`Received message on topic ${topic}: ${msg}`);

    if (topic.startsWith('library/locker/status/')) {
      const lockerId = topic.split('/').pop()!;
      handleLockerStatusUpdate(lockerId, msg);
    }
  });

  return mqttClient;
}

export function getClient(): MqttClient {
  if (!mqttClient) {
    return connectMQTT();
  }
  return mqttClient;
}

export function assignLockerAccess(
  lockerId: string,
  userId: string,
  transactionId: string,
  startTime: Date,
  endTime: Date
): boolean {
  const client = getClient();

  const payload = JSON.stringify({
    action: 'assign',
    lockerId,
    userId,
    transactionId,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
  });

  client.publish(`library/locker/control/${lockerId}`, payload, { qos: 1 });
  console.log(`Assigned locker ${lockerId} to user ${userId} for transaction ${transactionId}`);

  return true;
}

export function revokeLockerAccess(
  lockerId: string,
  userId: string,
  transactionId: string
): boolean {
  const client = getClient();

  const payload = JSON.stringify({
    action: 'revoke',
    lockerId,
    userId,
    transactionId,
  });

  client.publish(`library/locker/control/${lockerId}`, payload, { qos: 1 });
  console.log(`Revoked locker ${lockerId} access for user ${userId}`);

  return true;
}

function handleLockerStatusUpdate(lockerId: string, message: string): void {
  try {
    const status = JSON.parse(message);
    console.log(`Locker ${lockerId} status updated:`, status);

    // TODO: Integrasi dengan database jika diperlukan
    // updateLockerStatusInDatabase(lockerId, status);

  } catch (error) {
    console.error(`Error handling locker status update:`, error);
  }
}
