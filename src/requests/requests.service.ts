import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from './request.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    private readonly mailerService: MailerService,
  ) {}

  async createRequest(createRequestDto: CreateRequestDto): Promise<Request> {
    const request = this.requestRepository.create(createRequestDto);
    return this.requestRepository.save(request);
  }

  async getRequests(
    status?: 'Active' | 'Resolved',
    startDate?: string,
    endDate?: string,
  ): Promise<Request[]> {
    const query = this.requestRepository.createQueryBuilder('request');
    if (status) {
      query.andWhere('request.status = :status', { status });
    }
    if (startDate) {
      query.andWhere('request.created_at >= :startDate', {
        startDate: new Date(startDate),
      });
    }
    if (endDate) {
      query.andWhere('request.created_at <= :endDate', {
        endDate: new Date(endDate),
      });
    }
    return query.getMany();
  }

  async updateRequest(
    id: number,
    updateRequestDto: UpdateRequestDto,
  ): Promise<Request> {
    const request = await this.requestRepository.findOneBy({ id });
    if (!request) {
      throw new NotFoundException(`Request with id ${id} not found`);
    }
    Object.assign(request, updateRequestDto);
    const updatedRequest = await this.requestRepository.save(request);

    if (updatedRequest.status === 'Resolved') {
      await this.sendEmail(updatedRequest);
    }

    return updatedRequest;
  }

  private async sendEmail(request: Request) {
    await this.mailerService.sendMail({
      to: request.email,
      subject: 'Your request has been updated',
      template: './request-status',
      context: {
        name: request.name,
        status: request.status,
        comment: request.comment,
      },
    });
  }
}
