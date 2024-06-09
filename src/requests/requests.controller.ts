import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';

@ApiTags('requests')
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new request' })
  @ApiResponse({
    status: 201,
    description: 'The request has been successfully created.',
  })
  create(@Body() createRequestDto: CreateRequestDto) {
    return this.requestsService.createRequest(createRequestDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all requests' })
  @ApiResponse({ status: 200, description: 'Return all requests.' })
  findAll(
    @Query('status') status: 'Active' | 'Resolved',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.requestsService.getRequests(status, startDate, endDate);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a request status' })
  @ApiResponse({
    status: 200,
    description: 'The request has been successfully updated.',
  })
  update(@Param('id') id: number, @Body() updateRequestDto: UpdateRequestDto) {
    return this.requestsService.updateRequest(id, updateRequestDto);
  }
}
