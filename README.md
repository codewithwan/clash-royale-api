# Royale API Free

> Free, open-source Clash Royale API - No authentication required

## Overview

**Royale API Free** is a public REST API for Clash Royale that provides player stats, card data, and analytics without requiring API keys or authentication.

### Why This API?

- **No Auth Required** - Just hit the endpoint, no API key needed
- **Free Forever** - Completely free to use
- **Fast Response** - Optimized for speed
- **Well Documented** - Clear API documentation
- **Open Source** - Community-driven

## Quick Links

- **API Documentation**: Visit `/api-docs` when running locally or check the deployed API
- **API Base URL**: `https://your-api-url.com/api/v1`
- **Health Check**: `/health`

## Features Checklist

### ✅ Player Endpoints

- [x] Get complete player data (`GET /api/v1/player/:tag`)
  - Basic stats (name, level, trophies, arena)
  - Clan information (if in a clan)
  - Battle statistics
  - Card level breakdown
  - Tower cards collection
  - Hero/Champion cards collection
  - Evolution cards collection

- [x] Get player card statistics (`GET /api/v1/player/:tag/cards`)
  - Card level breakdown (levels 9-16)
  - Total cards at level 14+
  - Total cards at level 15+

- [x] Get player card collections (`GET /api/v1/player/:tag/collections`)
  - Tower cards list
  - Hero/Champion cards list
  - Evolution cards list

### ✅ System Endpoints

- [x] Health check (`GET /health`)

### 🔄 Planned Features

- [ ] Battle history endpoint
- [ ] All cards endpoint
- [ ] Meta decks endpoint
- [ ] Clan endpoints
- [ ] Rate limiting
- [ ] Caching
- [ ] API key system (optional)

## Roadmap

### Phase 1: Core Player Features ✅

- [x] Project setup
- [x] Player data endpoint
- [x] Card statistics endpoint
- [x] Card collections endpoint
- [x] Error handling
- [x] API documentation

### Phase 2: Additional Features

- [ ] Battle history endpoint
- [ ] All cards endpoint
- [ ] Rate limiting
- [ ] Caching layer
- [ ] Performance optimization

### Phase 3: Advanced Features

- [ ] Meta decks endpoint
- [ ] Clan endpoints
- [ ] Monitoring & analytics
- [ ] API key system

### Phase 4: Optimization

- [ ] Performance tuning
- [ ] Advanced caching strategies
- [ ] Load testing
- [ ] CDN integration

## Getting Started

### For Users

1. Visit the API documentation at `/api-docs` (when running) or check the deployed API
2. Use the endpoints listed above
3. No authentication required - just make requests!

### For Developers

1. Clone the repository
2. Install dependencies: `bun install`
3. Run development server: `bun dev`
4. Visit `http://localhost:3000/api-docs` for API documentation

## Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create feature branch
3. Make changes
4. Submit PR

## License

MIT License

## Credits

- **Data Source**: RoyaleAPI.com
- **Author**: codewithwan

## Support

- Issues: [GitHub Issues](https://github.com/codewithwan/clash-royale-api/issues)
- Discussions: [GitHub Discussions](https://github.com/codewithwan/clash-royale-api/discussions)

---

**Made with ⚔️ for the Clash Royale community**
