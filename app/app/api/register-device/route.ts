let nextDeviceId = 1;

export async function POST() {
  const deviceId = nextDeviceId++;
  return Response.json({ deviceId });
}
