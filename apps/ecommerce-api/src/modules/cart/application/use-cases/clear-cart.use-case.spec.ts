import { Test, TestingModule } from '@nestjs/testing';

import { ClearCartUseCase } from './clear-cart.use-case';
import { CartRepository } from '../../domain/repositories/cart.repository';

describe('ClearCartUseCase', () => {
  let useCase: ClearCartUseCase;
  const clearItemsByUserId = jest.fn();

  beforeEach(async () => {
    clearItemsByUserId.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClearCartUseCase,
        {
          provide: CartRepository,
          useValue: { clearItemsByUserId },
        },
      ],
    }).compile();

    useCase = module.get(ClearCartUseCase);
  });

  it('delegates to CartRepository.clearItemsByUserId with the given userId', async () => {
    clearItemsByUserId.mockResolvedValue(undefined);

    await useCase.execute('user-uuid-123');

    expect(clearItemsByUserId).toHaveBeenCalledTimes(1);
    expect(clearItemsByUserId).toHaveBeenCalledWith('user-uuid-123');
  });

  it('resolves without error when repository resolves', async () => {
    clearItemsByUserId.mockResolvedValue(undefined);

    await expect(useCase.execute('user-uuid-456')).resolves.toBeUndefined();
  });

  it('propagates errors thrown by the repository', async () => {
    const err = new Error('DB error');
    clearItemsByUserId.mockRejectedValue(err);

    await expect(useCase.execute('user-uuid-123')).rejects.toBe(err);
  });
});
