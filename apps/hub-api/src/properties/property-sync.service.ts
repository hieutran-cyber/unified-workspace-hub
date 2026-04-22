import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../database/database.module";

@Injectable()
export class PropertySyncService {
  private readonly logger = new Logger(PropertySyncService.name);

  constructor(private prisma: PrismaService) {}

  async syncProperty(propertyId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      this.logger.error(`❌ Property ${propertyId} not found`);
      return;
    }

    this.logger.log(`🔄 Syncing property: ${property.name} (${property.code})`);

    // 1. Sync to Odoo
    try {
      await this.syncToOdoo(property);
    } catch (error) {
      this.logger.error(`❌ Odoo sync failed: ${error.message}`);
    }

    // 2. Sync to PMS
    try {
      await this.syncToPms(property);
    } catch (error) {
      this.logger.error(`❌ PMS sync failed: ${error.message}`);
    }

    // 3. Sync to POS
    try {
      await this.syncToPos(property);
    } catch (error) {
      this.logger.error(`❌ POS sync failed: ${error.message}`);
    }
  }

  private async syncToOdoo(property: any) {
    this.logger.log(`[Odoo] Syncing property ${property.code}`);
    // Mock API call - in reality, we'd use fetch or XML-RPC
    const odooId = property.odooId || `odoo_prop_${Math.floor(Math.random() * 1000)}`;
    
    if (!property.odooId) {
      await this.prisma.property.update({
        where: { id: property.id },
        data: { odooId },
      });
      this.logger.log(`✅ [Odoo] Created property mapping: ${odooId}`);
    }
  }

  private async syncToPms(property: any) {
    this.logger.log(`[PMS] Syncing property ${property.code}`);
    const pmsId = property.pmsId || `pms_prop_${Math.floor(Math.random() * 1000)}`;

    if (!property.pmsId) {
      await this.prisma.property.update({
        where: { id: property.id },
        data: { pmsId },
      });
      this.logger.log(`✅ [PMS] Created property mapping: ${pmsId}`);
    }
  }

  private async syncToPos(property: any) {
    this.logger.log(`[POS] Syncing property ${property.code}`);
    const posId = property.posId || `pos_prop_${Math.floor(Math.random() * 1000)}`;

    if (!property.posId) {
      await this.prisma.property.update({
        where: { id: property.id },
        data: { posId },
      });
      this.logger.log(`✅ [POS] Created property mapping: ${posId}`);
    }
  }
}
