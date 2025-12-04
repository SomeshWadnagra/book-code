# BookBorg Frontend - Next.js Book Store

A production-ready Next.js frontend for a microservices-based digital bookstore platform.

## 🎯 Why Next.js?

- **Server-Side Rendering (SSR)**: Better SEO and initial page load
- **Static Generation**: Optimal performance for static content
- **API Routes**: Built-in backend capabilities if needed
- **Image Optimization**: Automatic image optimization
- **Built-in TypeScript**: Full type safety out of the box
- **Enterprise-Ready**: Used by major companies for production apps
- **Docker Ready**: Optimized for containerization and cloud deployment
- **No Build Tool Config**: Zero configuration needed

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Docker (optional, for containerization)

## 🚀 Quick Start

### Local Development

1. **Install dependencies**:
```bash
cd bookstore-frontend
npm install
```

2. **Create environment file**:
```bash
# Already provided as .env.local
# Update NEXT_PUBLIC_API_BASE_URL if needed
```

3. **Start dev server**:
```bash
npm run dev
```

Visit `http://localhost:3000`

### Docker Development

```bash
docker-compose up --build
```

## 📁 Project Structure

```
bookstore-frontend/
├── src/
│   ├── app/              # App Router (Next.js 13+)
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── BookCard.tsx
│   │   └── Header.tsx
│   ├── lib/             # Utilities and API
│   │   ├── api.ts       # Microservice client
│   │   └── utils.ts     # Helper functions
│   └── types/           # TypeScript types
├── public/              # Static assets
├── Dockerfile           # Production image
├── docker-compose.yml   # Local dev setup
├── next.config.js       # Next.js config
├── tsconfig.json        # TypeScript config
├── tailwind.config.js   # Tailwind config
└── package.json
```

## 🔧 Configuration

### Environment Variables

```env
# API Endpoint
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api

# AWS Cognito (optional, for authentication)
NEXT_PUBLIC_COGNITO_DOMAIN=your-cognito-domain
NEXT_PUBLIC_COGNITO_CLIENT_ID=your-client-id
NEXT_PUBLIC_COGNITO_REDIRECT_URI=http://localhost:3000/callback
```

## 🏗️ Microservices Integration

Pre-configured API client for all services:

```typescript
import { bookService, cartService, reviewService } from '@/lib/api';

// Books
await bookService.getBooks(1, 12);
await bookService.searchBooks('query');

// Cart
await cartService.getCart(userId);
await cartService.addToCart(userId, bookId, qty);

// Reviews
await reviewService.getBookReviews(bookId);
```

All endpoints automatically include authentication token from localStorage.

## 📦 Build & Deploy

### Build for production
```bash
npm run build
npm start
```

### Build Docker image
```bash
docker build -t bookstore-frontend:latest .
docker run -p 3000:3000 bookstore-frontend:latest
```

### Push to AWS ECR
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <aws-account>.dkr.ecr.us-east-1.amazonaws.com

# Build and tag
docker build -t bookstore-frontend:latest .
docker tag bookstore-frontend:latest <aws-account>.dkr.ecr.us-east-1.amazonaws.com/bookstore-frontend:latest

# Push
docker push <aws-account>.dkr.ecr.us-east-1.amazonaws.com/bookstore-frontend:latest
```

## 🚢 AWS Deployment

### Option 1: ECS Fargate (Recommended for simplicity)

1. **Create ECR Repository**:
```bash
aws ecr create-repository --repository-name bookstore-frontend
```

2. **Push Docker Image** (as shown above)

3. **Create ECS Task Definition**:
```json
{
  "family": "bookstore-frontend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "bookstore-frontend",
      "image": "<aws-account>.dkr.ecr.us-east-1.amazonaws.com/bookstore-frontend:latest",
      "portMappings": [{
        "containerPort": 3000,
        "protocol": "tcp"
      }],
      "environment": [
        {
          "name": "NEXT_PUBLIC_API_BASE_URL",
          "value": "https://api.yourdomain.com/api"
        }
      ]
    }
  ]
}
```

4. **Create ECS Service**:
```bash
aws ecs create-service \
  --cluster bookstore-cluster \
  --service-name bookstore-frontend \
  --task-definition bookstore-frontend \
  --desired-count 3 \
  --launch-type FARGATE \
  --network-configuration awsvpcConfiguration="{subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=DISABLED}"
```

### Option 2: EKS (Kubernetes)

See `DEPLOYMENT_GUIDE.md` for complete Terraform setup.

## 🔐 AWS Cognito Integration

To add authentication:

1. Create Cognito User Pool in AWS Console
2. Update `.env.local`:
```env
NEXT_PUBLIC_COGNITO_DOMAIN=bookstore-xxx.auth.us-east-1.amazoncognito.com
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxx
```

3. Install Amplify:
```bash
npm install @aws-amplify/auth @aws-amplify/ui-react
```

4. Implement login/register components

## 📊 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t bookstore-frontend:${{ github.sha }} .
      
      - name: Push to ECR
        run: |
          aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com
          docker tag bookstore-frontend:${{ github.sha }} ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com/bookstore-frontend:latest
          docker push ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com/bookstore-frontend:latest
      
      - name: Update ECS Service
        run: |
          aws ecs update-service --cluster bookstore-cluster --service bookstore-frontend-service --force-new-deployment
```

### Jenkins Pipeline

See `DEPLOYMENT_GUIDE.md` for Jenkinsfile configuration.

## 🎨 Components

**shadcn/ui Components:**
- Button
- Card
- Input
- Badge

**Custom Components:**
- Header (Navigation with cart/wishlist)
- BookCard (Book display with ratings)
- More coming soon...

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type check
npm run type-check
```

## 🔐 Security Best Practices

- ✅ API token stored securely in localStorage
- ✅ CORS configured for microservices
- ✅ Input validation with Zod
- ✅ Type-safe API calls
- ✅ XSS protection via React
- ✅ Environment variables for sensitive data

## 📝 Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🐛 Troubleshooting

### API Connection Issues
- Ensure microservices running on port 8080
- Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
- Verify CORS settings on backend

### Port Already in Use
```bash
# Run on different port
npm run dev -- -p 3001
```

### Build Errors
```bash
# Clean and rebuild
rm -rf .next node_modules
npm install
npm run build
```

## 📚 Technologies

- **Next.js 14**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **shadcn/ui**: Components
- **Axios**: HTTP client
- **Lucide React**: Icons

## 🚀 Performance

- Image optimization with Next.js Image component
- Automatic code splitting
- Server-side rendering for better SEO
- Optimized bundle size
- Caching strategies

## 📞 Support

1. Check troubleshooting section
2. Review API documentation in `src/lib/api.ts`
3. Check Next.js docs: https://nextjs.org/docs

## 🔮 Future Features

- [ ] AWS Cognito authentication
- [ ] Advanced book filtering
- [ ] Book previews/samples
- [ ] User reviews with images
- [ ] Wishlist sync
- [ ] Advanced recommendations
- [ ] Analytics integration
- [ ] Dark mode

## 📄 License

MIT License

---

**Ready for production deployment** 🚀
