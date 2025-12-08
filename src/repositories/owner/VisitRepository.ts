/**
 * @module repositories/owner/VisitRepository
 * @description Custom TypeORM repository for the `Visit` entity,
 *              providing specialized data access methods.
 */

import { Repository } from 'typeorm';
import { AppDataSource } from '@config/database';
import { Visit } from '@models/owner/Visit';

/**
 * @class VisitRepository
 * @extends {Repository<Visit>}
 * @description Repository class for `Visit` domain objects, extending TypeORM's base Repository.
 */
export class VisitRepository extends Repository<Visit> {
  constructor() {
    super(Visit, AppDataSource.createEntityManager());
  }

  /**
   * @method saveVisit
   * @description Saves a `Visit` entity to the database.
   * @param {Visit} visit - The visit entity to save.
   * @returns {Promise<Visit>} The saved visit entity.
   */
  async saveVisit(visit: Visit): Promise<Visit> {
    return this.save(visit);
  }
}

// Export a singleton instance of the VisitRepository
export const visitRepository = new VisitRepository();
