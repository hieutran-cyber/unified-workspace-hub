import { Controller, Get, Post, Body, UseGuards, Req, Param } from "@nestjs/common";
import { OrganizationsService } from "./organizations.service";
import { MultiAuthGuard } from "../auth/multi-auth.guard";

@Controller("organizations")
@UseGuards(MultiAuthGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  async create(@Body("name") name: string, @Req() req: any) {
    const { userId, provider } = req.user;
    return this.organizationsService.create(name, userId, provider);
  }

  @Get()
  async findAll(@Req() req: any) {
    const { userId } = req.user;
    return this.organizationsService.findAll(userId);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.organizationsService.findOne(id);
  }
}
