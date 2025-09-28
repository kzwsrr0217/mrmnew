// mrmnew/backend/src/forms/forms.controller.ts

import { Body, Controller, Post, Res, StreamableFile, Request } from '@nestjs/common';
import { FormsService } from './forms.service';
import { GenerateAccessRequestDto } from './dto/generate-access-request.dto';
import type { Response } from 'express';

@Controller('forms')
export class FormsController {
    constructor(private readonly formsService: FormsService) {}

    @Post('generate/access-request')
    async generateAccessRequest(
        @Body() dto: GenerateAccessRequestDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<StreamableFile> {
        const pdfBytes = await this.formsService.generateAccessRequestPdf(dto);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="hozzaferesi_kerelem.pdf"',
        });
        return new StreamableFile(pdfBytes);
    }

    @Post('generate/access-request-with-ticket')
    async generatePdfAndCreateTicket(
        @Body() dto: GenerateAccessRequestDto,
        @Request() req: any,
        @Res({ passthrough: true }) res: Response,
    ): Promise<StreamableFile> {
        const pdfBytes = await this.formsService.generatePdfAndCreateTicket(dto, req.user);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="hozzaferesi_kerelem_kulso_ra.pdf"',
        });
        return new StreamableFile(pdfBytes);
    }
}