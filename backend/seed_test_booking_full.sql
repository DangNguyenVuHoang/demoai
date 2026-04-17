BEGIN;

-- =========================
-- RESET ALL DATA
-- =========================
DELETE FROM "Payment";
DELETE FROM "BookingSeat";
DELETE FROM "Booking";
DELETE FROM "Showtime";
DELETE FROM "Seat";
DELETE FROM "Theater";
DELETE FROM "Cinema";
DELETE FROM "Movie";
DELETE FROM "User";

-- =========================
-- USERS
-- =========================
INSERT INTO "User" (
  "id",
  "fullName",
  "email",
  "passwordHash",
  "phone",
  "role",
  "createdAt",
  "updatedAt"
)
VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Test Customer',
  'user@test.com',
  '123456',
  '0900000001',
  'CUSTOMER',
  NOW(),
  NOW()
),
(
  '22222222-2222-2222-2222-222222222222',
  'Second Customer',
  'user2@test.com',
  '123456',
  '0900000002',
  'CUSTOMER',
  NOW(),
  NOW()
),
(
  '33333333-3333-3333-3333-333333333333',
  'Admin User',
  'admin@test.com',
  '123456',
  '0900000003',
  'ADMIN',
  NOW(),
  NOW()
);

-- =========================
-- MOVIES
-- =========================
INSERT INTO "Movie" (
  "id",
  "title",
  "slug",
  "description",
  "durationMinutes",
  "ageRating",
  "posterUrl",
  "trailerUrl",
  "language",
  "subtitle",
  "releaseDate",
  "endDate",
  "status",
  "createdAt",
  "updatedAt"
)
VALUES
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
  'Avengers Test',
  'avengers-test',
  'Movie for booking test',
  120,
  'P13',
  'https://example.com/poster.jpg',
  'https://example.com/trailer.mp4',
  'English',
  'Vietnamese',
  NOW() - INTERVAL '7 days',
  NOW() + INTERVAL '30 days',
  'NOW_SHOWING',
  NOW(),
  NOW()
);

-- =========================
-- CINEMAS
-- =========================
INSERT INTO "Cinema" (
  "id",
  "name",
  "brand",
  "city",
  "address",
  "status",
  "createdAt",
  "updatedAt"
)
VALUES
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
  'CGV Test Cinema',
  'CGV',
  'Ho Chi Minh City',
  '123 Test Street',
  TRUE,
  NOW(),
  NOW()
);

-- =========================
-- THEATERS
-- =========================
INSERT INTO "Theater" (
  "id",
  "cinemaId",
  "name",
  "type",
  "totalRows",
  "totalCols",
  "status",
  "createdAt",
  "updatedAt"
)
VALUES
(
  'cccccccc-cccc-cccc-cccc-ccccccccccc1',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
  'Room 1',
  'TWO_D',
  5,
  5,
  TRUE,
  NOW(),
  NOW()
);

-- =========================
-- SEATS (A1 -> E5)
-- STANDARD: +0
-- VIP: +20000
-- COUPLE: +50000
-- =========================
INSERT INTO "Seat" (
  "id",
  "theaterId",
  "seatRow",
  "seatNumber",
  "seatType",
  "priceModifier",
  "status",
  "createdAt",
  "updatedAt"
)
VALUES
('d0000000-0000-0000-0000-000000000001','cccccccc-cccc-cccc-cccc-ccccccccccc1','A',1,'STANDARD',0,TRUE,NOW(),NOW()),
('d0000000-0000-0000-0000-000000000002','cccccccc-cccc-cccc-cccc-ccccccccccc1','A',2,'STANDARD',0,TRUE,NOW(),NOW()),
('d0000000-0000-0000-0000-000000000003','cccccccc-cccc-cccc-cccc-ccccccccccc1','A',3,'STANDARD',0,TRUE,NOW(),NOW()),
('d0000000-0000-0000-0000-000000000004','cccccccc-cccc-cccc-cccc-ccccccccccc1','A',4,'STANDARD',0,TRUE,NOW(),NOW()),
('d0000000-0000-0000-0000-000000000005','cccccccc-cccc-cccc-cccc-ccccccccccc1','A',5,'STANDARD',0,TRUE,NOW(),NOW()),

('d0000000-0000-0000-0000-000000000006','cccccccc-cccc-cccc-cccc-ccccccccccc1','B',1,'STANDARD',0,TRUE,NOW(),NOW()),
('d0000000-0000-0000-0000-000000000007','cccccccc-cccc-cccc-cccc-ccccccccccc1','B',2,'STANDARD',0,TRUE,NOW(),NOW()),
('d0000000-0000-0000-0000-000000000008','cccccccc-cccc-cccc-cccc-ccccccccccc1','B',3,'STANDARD',0,TRUE,NOW(),NOW()),
('d0000000-0000-0000-0000-000000000009','cccccccc-cccc-cccc-cccc-ccccccccccc1','B',4,'STANDARD',0,TRUE,NOW(),NOW()),
('d0000000-0000-0000-0000-000000000010','cccccccc-cccc-cccc-cccc-ccccccccccc1','B',5,'STANDARD',0,TRUE,NOW(),NOW()),

('d0000000-0000-0000-0000-000000000011','cccccccc-cccc-cccc-cccc-ccccccccccc1','C',1,'VIP',20000,TRUE,NOW(),NOW()),
('d0000000-0000-0000-0000-000000000012','cccccccc-cccc-cccc-cccc-ccccccccccc1','C',2,'VIP',20000,TRUE,NOW(),NOW()),
('d0000000-0000-0000-0000-000000000013','cccccccc-cccc-cccc-cccc-ccccccccccc1','C',3,'VIP',20000,TRUE,NOW(),NOW()),
('d0000000-0000-0000-0000-000000000014','cccccccc-cccc-cccc-cccc-ccccccccccc1','C',4,'VIP',20000,TRUE,NOW(),NOW()),
('d0000000-0000-0000-0000-000000000015','cccccccc-cccc-cccc-cccc-ccccccccccc1','C',5,'VIP',20000,TRUE,NOW(),NOW()),

('d0000000-0000-0000-0000-000000000016','cccccccc-cccc-cccc-cccc-ccccccccccc1','D',1,'VIP',20000,TRUE,NOW(),NOW()),
('d0000000-0000-0000-0000-000000000017','cccccccc-cccc-cccc-cccc-ccccccccccc1','D',2,'VIP',20000,TRUE,NOW(),NOW()),
('d0000000-0000-0000-0000-000000000018','cccccccc-cccc-cccc-cccc-ccccccccccc1','D',3,'VIP',20000,TRUE,NOW(),NOW()),
('d0000000-0000-0000-0000-000000000019','cccccccc-cccc-cccc-cccc-ccccccccccc1','D',4,'VIP',20000,TRUE,NOW(),NOW()),
('d0000000-0000-0000-0000-000000000020','cccccccc-cccc-cccc-cccc-ccccccccccc1','D',5,'VIP',20000,TRUE,NOW(),NOW()),

('d0000000-0000-0000-0000-000000000021','cccccccc-cccc-cccc-cccc-ccccccccccc1','E',1,'COUPLE',50000,TRUE,NOW(),NOW()),
('d0000000-0000-0000-0000-000000000022','cccccccc-cccc-cccc-cccc-ccccccccccc1','E',2,'COUPLE',50000,TRUE,NOW(),NOW()),
('d0000000-0000-0000-0000-000000000023','cccccccc-cccc-cccc-cccc-ccccccccccc1','E',3,'COUPLE',50000,TRUE,NOW(),NOW()),
('d0000000-0000-0000-0000-000000000024','cccccccc-cccc-cccc-cccc-ccccccccccc1','E',4,'COUPLE',50000,TRUE,NOW(),NOW()),
('d0000000-0000-0000-0000-000000000025','cccccccc-cccc-cccc-cccc-ccccccccccc1','E',5,'COUPLE',50000,TRUE,NOW(),NOW());

-- =========================
-- SHOWTIME
-- =========================
INSERT INTO "Showtime" (
  "id",
  "movieId",
  "theaterId",
  "startTime",
  "endTime",
  "basePrice",
  "status",
  "createdAt",
  "updatedAt"
)
VALUES
(
  'f1111111-1111-1111-1111-111111111111',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
  'cccccccc-cccc-cccc-cccc-ccccccccccc1',
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '1 day 2 hours',
  70000,
  'OPEN',
  NOW(),
  NOW()
);

-- =========================
-- SAMPLE PAID BOOKING (A1, A2 blocked in DB)
-- =========================
INSERT INTO "Booking" (
  "id",
  "userId",
  "showtimeId",
  "bookingCode",
  "totalAmount",
  "status",
  "expiredAt",
  "createdAt",
  "updatedAt"
)
VALUES
(
  '77777777-7777-7777-7777-777777777777',
  '11111111-1111-1111-1111-111111111111',
  'f1111111-1111-1111-1111-111111111111',
  'BKTESTPAID001',
  140000,
  'PAID',
  NOW() + INTERVAL '10 minutes',
  NOW(),
  NOW()
);

INSERT INTO "BookingSeat" (
  "id",
  "bookingId",
  "seatId",
  "priceAtBooking"
)
VALUES
(
  '90000000-0000-0000-0000-000000000001',
  '77777777-7777-7777-7777-777777777777',
  'd0000000-0000-0000-0000-000000000001',
  70000
),
(
  '90000000-0000-0000-0000-000000000002',
  '77777777-7777-7777-7777-777777777777',
  'd0000000-0000-0000-0000-000000000002',
  70000
);

INSERT INTO "Payment" (
  "id",
  "bookingId",
  "provider",
  "transactionRef",
  "gatewayTransactionId",
  "amount",
  "status",
  "paymentUrl",
  "paidAt",
  "rawResponse",
  "createdAt",
  "updatedAt"
)
VALUES
(
  '99999999-9999-9999-9999-999999999999',
  '77777777-7777-7777-7777-777777777777',
  'VNPAY',
  'BKTESTPAID001',
  'VNPAYDEMOTXN001',
  140000,
  'SUCCESS',
  'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?demo=1',
  NOW(),
  '{"demo":"success"}'::jsonb,
  NOW(),
  NOW()
);

COMMIT;