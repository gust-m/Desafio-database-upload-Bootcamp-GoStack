import { EntityRepository, Repository } from 'typeorm';

import Category from '../models/Category';

@EntityRepository(Category)
class CategorysRepository extends Repository<Category> {
  public async checkCategoryTitleExists(
    category: string,
  ): Promise<Category | null> {
    const categoryTitleExists = await this.findOne({
      where: { title: category },
    });

    return categoryTitleExists || null;
  }
}

export default CategorysRepository;
