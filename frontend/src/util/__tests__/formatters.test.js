import { formatGameMode } from '../formatters';

describe('formatters', () => {
  describe('formatGameMode', () => {
    it('should return \'other\' for null', () => {
      expect(formatGameMode(null)).toEqual('Other');
    });
    it('should capitalize non-null input', () => {
      expect(formatGameMode('solo')).toEqual('Solo');
    });
  });
});
