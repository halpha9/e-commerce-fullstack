import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const USERS_TO_CREATE = 20;
const PRODUCTS_MIN = 1;
const PRODUCTS_MAX = 20;

async function run() {
  const userData = Array(USERS_TO_CREATE)
    .fill(null)
    .map(() => {
      return {
        username: faker.internet.userName().toLowerCase(),
        password: faker.internet.password(),
        email: faker.internet.email().toLocaleLowerCase(),
        image: faker.image.avatar(),
      };
    });

  const createUsers = userData.map((user) =>
    prisma.user.create({ data: user })
  );

  const users = await prisma.$transaction(createUsers);

  const products = [];

  for (let i = 0; i < users.length; i++) {
    const amount = faker.datatype.number({
      min: PRODUCTS_MIN,
      max: PRODUCTS_MAX,
    });

    for (let ii = 0; ii < amount; ii++) {
      products.push({
        quantity: faker.datatype.number({ min: 1, max: 100 }),
        price: Number(faker.commerce.price(10, 200, 0)),
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        category: faker.commerce.department(),
        image: faker.image.fashion(),
      });
    }
  }

  const createProducts = products.map((product) =>
    prisma.product.create({ data: product })
  );

  await prisma.$transaction(createProducts);

  await prisma.$disconnect();
}

run();
