import { Test, TestingModule } from '@nestjs/testing';
import { RequestsService } from '../src/requests/requests.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from '../src/requests/request.entity';
import { CreateRequestDto } from '../src/requests/dto/create-request.dto';
import { UpdateRequestDto } from '../src/requests/dto/update-request.dto';
import { NotFoundException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { MailerModule } from '@nestjs-modules/mailer';

describe('RequestsService', () => {
  let service: RequestsService;
  let repo: Repository<Request>;

  const mockMailerService = {
    sendMail: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MailerModule.forRoot({
          transport: {
            host: 'smtp.example.com',
            port: 587,
            auth: {
              user: 'user@example.com',
              pass: 'password',
            },
          },
          defaults: {
            from: '"No Reply" <no-reply@example.com>',
          },
        }),
      ],
      providers: [
        RequestsService,
        {
          provide: getRepositoryToken(Request),
          useClass: Repository,
        },
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
    repo = module.get<Repository<Request>>(getRepositoryToken(Request));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new request', async () => {
    const createRequestDto: CreateRequestDto = {
      name: 'Test User',
      email: 'test@example.com',
      message: 'This is a test message',
    };

    const request: Request = {
      id: 1,
      ...createRequestDto,
      status: 'Active',
      comment: '',
      created_at: new Date(),
      updated_at: new Date(),
    };

    jest.spyOn(repo, 'create').mockReturnValue(request);
    jest.spyOn(repo, 'save').mockResolvedValue(request);

    expect(await service.createRequest(createRequestDto)).toEqual(request);
  });

  it('should return all requests', async () => {
    const request: Request = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      message: 'This is a test message',
      status: 'Active',
      comment: '',
      created_at: new Date(),
      updated_at: new Date(),
    };

    jest.spyOn(repo, 'find').mockResolvedValue([request]);

    expect(await service.getRequests()).toEqual([request]);
  });

  it('should update a request', async () => {
    const updateRequestDto: UpdateRequestDto = {
      status: 'Resolved',
      comment: 'This is a test comment',
    };

    const request: Request = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      message: 'This is a test message',
      status: 'Active',
      comment: '',
      created_at: new Date(),
      updated_at: new Date(),
    };

    const updatedRequest = {
      ...request,
      ...updateRequestDto,
    };

    jest.spyOn(repo, 'findOneBy').mockResolvedValue(request);
    jest.spyOn(repo, 'save').mockResolvedValue(updatedRequest);

    expect(await service.updateRequest(1, updateRequestDto)).toEqual(updatedRequest);
  });

  it('should throw an error if request not found', async () => {
    const updateRequestDto: UpdateRequestDto = {
      status: 'Resolved',
      comment: 'This is a test comment',
    };

    jest.spyOn(repo, 'findOneBy').mockResolvedValue(null);

    await expect(service.updateRequest(1, updateRequestDto)).rejects.toThrow(NotFoundException);
  });
});
