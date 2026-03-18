import { faker } from "@faker-js/faker";

export const generateTestUser = () => ({
  email: faker.internet.email(),
  username: faker.internet
    .username()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ""),
  name: faker.person.fullName(),
  password: "TestPassword123!",
});

export const generateTestSeries = () => ({
  title: faker.lorem.words(3),
  genre: faker.helpers.arrayElement(["DRAMA", "COMEDY", "ACTION", "THRILLER"]),
  logline: faker.lorem.sentence(),
});

export const generateTestScript = () => ({
  title: faker.lorem.words(2),
});

export const generateTestCharacter = () => ({
  name: faker.person.fullName(),
  description: faker.lorem.paragraph(),
});

export const generateTestLocation = () => ({
  name: faker.location.city(),
  description: faker.lorem.paragraph(),
});
