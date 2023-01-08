﻿using System;
using System.Text.Json;
using System.Threading.Tasks;

using Microsoft.Extensions.Options;
using StackExchange.Redis;

using HomeBudget.Core.Models;
using HomeBudget.Core.Services.Interfaces;

namespace HomeBudget.Core.Services
{
    internal class RedisCacheService : BaseService, IRedisCacheService
    {
        private readonly IDatabase _redisDatabase;
        private readonly string _redisConnectionString;
        private readonly CacheStoreOptions _cacheOptions;

        public RedisCacheService(IDatabase redisDatabase, IOptions<CacheStoreOptions> cacheOptions, IOptions<DatabaseOptions> databaseOptions)
        {
            _redisDatabase = redisDatabase;
            _redisConnectionString = databaseOptions.Value.RedisConnectionString;
            _cacheOptions = cacheOptions.Value;
        }

        public Task<bool> KeyExistsAsync(string cacheKey)
        {
            return _redisDatabase.KeyExistsAsync(cacheKey);
        }

        public async Task<T> GetAsync<T>(string cacheKey)
        {
            var cacheValue = await _redisDatabase.StringGetAsync(cacheKey);

            if (cacheValue.IsNullOrEmpty)
            {
                return await Task.FromResult<T>(default);
            }

            return JsonSerializer.Deserialize<T>(cacheValue);
        }

        public Task<bool> AddAsync<T>(string cacheKey, T cacheValue)
        {
            return Equals(cacheValue, default(T))
                ? Task.FromResult(false)
                : _redisDatabase.StringSetAsync(
                    cacheKey,
                    JsonSerializer.Serialize(cacheValue),
                    TimeSpan.FromMinutes(_cacheOptions.ExpirationInMinutes));
        }

        public Task FlushDatabaseAsync() => GetCurrentServer().FlushDatabaseAsync();

        public async Task<Result<T>> CacheWrappedMethodAsync<T>(string cacheKey, Func<Task<Result<T>>> wrappedMethod)
        {
            if (await KeyExistsAsync(cacheKey))
            {
                return Succeeded(await GetAsync<T>(cacheKey));
            }

            if (wrappedMethod is null)
            {
                throw new ArgumentNullException(nameof(wrappedMethod));
            }

            var cacheValue = await wrappedMethod.Invoke();
            await AddAsync(cacheKey, cacheValue.Payload);

            return Succeeded(await GetAsync<T>(cacheKey));
        }

        private IServer GetCurrentServer() => _redisDatabase.Multiplexer.GetServer(_redisConnectionString);
    }
}
