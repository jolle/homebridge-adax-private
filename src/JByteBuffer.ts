import ByteBuffer from 'bytebuffer';

export abstract class JByteBufferElement<T> {
  constructor(protected value: T) {}

  abstract encode(buffer: ByteBuffer): void;
}

class JLong extends JByteBufferElement<number> {
  encode(buffer: ByteBuffer) {
    buffer.writeLong(this.value);
  }
}

class JInt extends JByteBufferElement<number> {
  encode(buffer: ByteBuffer) {
    buffer.writeInt(this.value);
  }
}

export const jbb = {
  long: (val: number) => new JLong(val),
  int: (val: number) => new JInt(val),
};
