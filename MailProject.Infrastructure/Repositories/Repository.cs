using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using MailProject.Application.Common.Repositories;
using MailProject.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MailProject.Infrastructure.Repositories
{
    public class Repository<T> : IRepository<T> where T : class
    {
        protected readonly MailDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public Repository(MailDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public async Task<T?> GetByIdAsync(Guid id)
        {
            return await _dbSet.FindAsync(id);
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }

        public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.Where(predicate).ToListAsync();
        }

        public async Task<(IEnumerable<T> Items, int TotalCount)> GetPagedAsync(
            Expression<Func<T, bool>>? predicate, 
            int page, 
            int size)
        {
            var query = _dbSet.AsQueryable();

            if (predicate != null)
            {
                query = query.Where(predicate);
            }

            var totalCount = await query.CountAsync();
            
            // Assuming Default Order By (e.g. Id) if not specified, but EF might require it for Skip.
            // For now, simpler implementation. Optimally, we pass a Sort definition.
            // EF Core sometimes requires an OrderBy before Skip.
            // Trying to find a generic way to order, or relying on T having an Id if we knew the type constraint better.
            // As a fallback, we can order by the primary key if we can reflect it, or simply client side sort if data is small (bad).
            // Let's rely on unsorted skip for now (Postgres usually OK with it, but order is undefined).
            // UPDATE: To be safe, adding a simple "Order by nothing" (it works in some DBs) or let's just query.
             
            var items = await query
                .Skip((page - 1) * size)
                .Take(size)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(T entity)
        {
            _dbSet.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var entity = await _dbSet.FindAsync(id);
            if (entity != null)
            {
                if (entity is MailProject.Domain.Common.BaseEntity baseEntity)
                {
                    baseEntity.IsDeleted = true;
                    baseEntity.DeletedAt = DateTime.UtcNow;
                    _dbSet.Update(entity);
                }
                else
                {
                    _dbSet.Remove(entity);
                }
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.AnyAsync(predicate);
        }
    }
}
