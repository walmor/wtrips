# wTrips - Demo project

This is a simple project where I showcase some of my full-stack software development skills, knowledge of best practices and also serve as a playground to try new things.

It's a simple app to manage trips using hierarchical role-based access control. The app is functional but is still a work in progress.

## Online Demo

URL: https://wtrips-demo.firebaseapp.com/<br/>
User: admin@example.com<br/>
Password: 123456

## Front-end

The front-end started with React 15.x and bootstrapped using [create-react-app](https://github.com/facebook/create-react-app). The plan is to update the project to use React 16.x and use its new features such as [Suspense](https://medium.com/@baphemot/understanding-react-suspense-1c73b4b0b1e6) and [Hooks](https://reactjs.org/docs/hooks-intro.html).

### Design

The project is using the [Ant Design](https://ant.design/) UI framework which, in my opinion, is one of the best ones. It looks awesome and has a bunch of high-quality components.

I'm also following some [Responsive Design guidelines](https://developers.google.com/web/fundamentals/design-and-ux/responsive/), especially making using of media queries, so the app can be used on laptops, tablets, and phones without problems.

### Styling

The CSS preprocessor [SASS](https://sass-lang.com/) (with SCSS syntax) was used to style the application. The SCSS files were organized following the [7-1 architecture pattern](https://sass-guidelin.es/#the-7-1-pattern) and some tips of the [Sass Guidelines](https://sass-guidelin.es/) were adopted as well.

To better structure the CSS classes, some naming conventions were tested like BEM and OOCSS. However, after some experiments, the [SUIT name convention](https://suitcss.github.io/) was chosen because it plays well with React components. But maybe it's just a personal preference.

### State Management

For state management, [MobX](https://mobx.js.org/) was chosen just because I'd like to play with it a bit. It is cool, but I didn't like it much because many things happen behind the scenes and you kinda lose control over them. I intend to move to [Redux](https://redux.js.org/) and use its functional approach.

## Back-end

The back-end is a regular stateless REST API built with Node.js and [Express](https://expressjs.com/).

### Database

To persist data I'm using Postgres, just because of my large experiece with it. I'm also creating a thin repository layer using [knex](http://knexjs.org/) (a query builder library) together with the [Objection ORM](https://vincit.github.io/objection.js/).

### Validation and sanitization

For validation of the request payloads, [yup](https://github.com/jquense/yup) is being used. One of the most popular projects for validation is [joi](https://github.com/hapijs/joi), but I chose _yup_ because _joi_ has some limitations with async validation. I'm also using the [xss library](https://www.npmjs.com/package/xss) to prevent XSS attacks.

### Authentication and authorization

The authentication was done using [JSON Web Tokens (JWT)](https://jwt.io/) that are sent through the Authorization header, which is the most recommended way to build authentication for a stateless API. For authorization, the project is using a simple access control list, built with the [virgen-acl package](https://www.npmjs.com/package/virgen-acl).

## Testing

Unit tests were written using [Jest](https://jestjs.io/). End-to-end tests were created using [Cypress](https://www.cypress.io/), which is an awesome tool and turns the usually painful task of creating that end-to-end test a breeze.

## Linters

The project is using [ESLint](https://eslint.org), one of the most popular JavaScript linters, together with the rules provided by the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript), with just some few customizations.

The [Stylelint](https://stylelint.io/) linter, in conjunction with the SASS guidelines, is also used to format and verify the project's SCSS code.

## Docker

[Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) were introduced later. The first intention was to use the images for deployment but it also was used to experiment with the idea of using Docker for development, which is interesting, especially in big projects where, at least in theory, we could run one command (docker-compose up) and have everything we need to start the app (database, Redis cache, queues, etc) without having to set up anything in your local machine.

## CI/CD

I'm using [CircleCI](https://circleci.com/) to enable Continuous Integration and a pretty simple Continuous Delivery process. I had some troubles with CircleCI though. Especially problems related to the cache when I was trying to decrease the build time by leveraging Docker cache and also when I was trying to run the end-to-end tests - they got pretty inconsistent, sometimes falling because of timeouts. I gave up solving those problems for a while and I'll try another tool when I have more time.

## Hosting

The first idea was to deploy the app to AWS Elastic Beanstalk, as I have some experience with it. But The AWS Free Tier only gives us 12 months of free EC2 usage and I wasn't willing to pay to keep an EC2 instance up all the time after that period.

Then, after a little struggle, I've found a free forever approach. The back-end is hosted on Heroku and the front-end hosted on Firebase. I'd like to use one single service, but it turns out that Heroku is not so good for hosting static files (it's possible, but it's kinda hacky) and Firebase cannot host Node.js apps. Another solution is to serve the static files through the back-end Express server but I'd have to change the current code and the Docker image to enable that.
