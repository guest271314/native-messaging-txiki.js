#!tjs run
// txiki.js Native Messaging host
// guest271314, 2-10-2023

let encoder = new TextEncoder();
//let decoder = new TextDecoder();

async function readFullAsync(length) {
  const buffer = new Uint8Array(65536);
  const data = [];
  while (data.length < length) {
    const n = await tjs.stdin.read(buffer);
    if (n === null) {
      break;
    }
    data.push(...buffer.subarray(0, n));
  }
  return new Uint8Array(data);
}

async function getMessage() {
  const header = new Uint8Array(4);
  await tjs.stdin.read(header);
  const [length] = new Uint32Array(
    header.buffer
  );
  const output = await readFullAsync(length);
  return output;
}

async function sendMessage(message) {
  // https://stackoverflow.com/a/24777120
  const header = Uint32Array.from(
    {
      length: 4,
    },
    (_, index) => (message.length >> (index * 8)) & 0xff
  );
  const output = new Uint8Array(header.length + message.length);
  output.set(header, 0);
  output.set(message, 4);
  await tjs.stdout.write(output);
  return true;
}

async function main() {
  // let message, proc, data;
  try {
    while (true) {
      const message = await getMessage();
      await sendMessage(message);
    }
  } catch (e) {
    tjs.exit();
  }
}

main();
