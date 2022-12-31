import ByteBuffer from 'bytebuffer';
import { jbb } from '../src/JByteBuffer';

describe('JByteBuffer', () => {
  it('encodes longs correctly', () => {
    const buffer = new ByteBuffer();
    jbb.long(100).encode(buffer);
    expect(buffer.buffer.toString('hex')).toEqual(
      '00000000000000640000000000000000',
    );
  });

  it('encodes ints correctly', () => {
    const buffer = new ByteBuffer();
    jbb.int(100).encode(buffer);
    expect(buffer.buffer.toString('hex')).toEqual(
      '00000064000000000000000000000000',
    );
  });
});
