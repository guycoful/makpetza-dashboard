import { describe, it, expect, beforeEach } from 'vitest';
import { on, off, emit } from '../../js/core/events.js';

describe('Event Bus', () => {
  it('on + emit: callback receives data', () => {
    let received = null;
    on('test-event', (data) => { received = data; });
    emit('test-event', { value: 42 });
    expect(received).toEqual({ value: 42 });
  });

  it('multiple listeners on same event all fire', () => {
    const results = [];
    on('multi', () => results.push('a'));
    on('multi', () => results.push('b'));
    emit('multi');
    expect(results).toEqual(['a', 'b']);
  });

  it('off removes specific listener', () => {
    let count = 0;
    const handler = () => { count++; };
    on('remove-test', handler);
    emit('remove-test');
    expect(count).toBe(1);
    off('remove-test', handler);
    emit('remove-test');
    expect(count).toBe(1); // should not increment
  });

  it('emit with no listeners does not throw', () => {
    expect(() => emit('nonexistent-event', { x: 1 })).not.toThrow();
  });

  it('listeners fire in registration order', () => {
    const order = [];
    on('order-test', () => order.push(1));
    on('order-test', () => order.push(2));
    on('order-test', () => order.push(3));
    emit('order-test');
    expect(order).toEqual([1, 2, 3]);
  });

  it('off on non-existent event does not throw', () => {
    expect(() => off('nope', () => {})).not.toThrow();
  });
});
