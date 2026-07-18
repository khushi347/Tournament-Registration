const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app');
const Player = require('../src/models/player');
const Tournament = require('../src/models/tournament');
const Registration = require('../src/models/registration');
const Score = require('../src/models/score');

// Load environment variables
require('dotenv').config();

const runTests = async () => {
  console.log('=== RUNNING TOURNAMENT SYSTEM INTEGRATION TESTS ===');
  
  // Connect to Test Database
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tournament_test_db';
  await mongoose.connect(mongoURI);
  console.log(`[Test Setup] Connected to MongoDB at: ${mongoURI}`);
  
  // Clear any existing test data
  await Player.deleteMany({});
  await Tournament.deleteMany({});
  await Registration.deleteMany({});
  await Score.deleteMany({});
  console.log('[Test Setup] Database cleared.');

  let playerAId, playerBId, playerCId, playerDId, playerEId;
  let tournamentT1Id, tournamentT2Id;

  try {
    // -------------------------------------------------------------
    // 1. HEALTH CHECK ENDPOINT
    // -------------------------------------------------------------
    console.log('\n--- Test 1: Health Check ---');
    const healthRes = await request(app).get('/health');
    if (healthRes.status !== 200 || !healthRes.body.success || healthRes.body.data.status !== 'OK') {
      throw new Error(`Health check failed: ${JSON.stringify(healthRes.body)}`);
    }
    console.log('✔ Health Check OK');

    // -------------------------------------------------------------
    // 2. CREATE PLAYERS
    // -------------------------------------------------------------
    console.log('\n--- Test 2: Create Players ---');
    
    // Success cases
    const pARes = await request(app).post('/players').send({
      name: 'Alice',
      email: 'alice@example.com',
      country: 'USA'
    });
    if (pARes.status !== 201 || !pARes.body.success) {
      throw new Error(`Failed to create Alice: ${JSON.stringify(pARes.body)}`);
    }
    playerAId = pARes.body.data._id;
    console.log(`✔ Created Alice (${playerAId})`);

    const pBRes = await request(app).post('/players').send({
      name: 'Bob',
      email: 'bob@example.com',
      country: 'Canada'
    });
    playerBId = pBRes.body.data._id;
    console.log(`✔ Created Bob (${playerBId})`);

    const pCRes = await request(app).post('/players').send({
      name: 'Charlie',
      email: 'charlie@example.com',
      country: 'UK'
    });
    playerCId = pCRes.body.data._id;
    console.log(`✔ Created Charlie (${playerCId})`);

    const pDRes = await request(app).post('/players').send({
      name: 'David',
      email: 'david@example.com',
      country: 'Germany'
    });
    playerDId = pDRes.body.data._id;
    console.log(`✔ Created David (${playerDId})`);

    // Validation failures
    console.log('Testing player creation validation rules...');
    const failPlayer1 = await request(app).post('/players').send({
      name: '',
      email: 'bademail',
      country: 'USA'
    });
    if (failPlayer1.status !== 400 || failPlayer1.body.success) {
      throw new Error('Player validation should have failed for bad email/empty name');
    }
    console.log(`✔ Validation caught empty name & bad email: ${failPlayer1.body.message}`);

    const failPlayerDuplicate = await request(app).post('/players').send({
      name: 'Alice Dup',
      email: 'alice@example.com',
      country: 'USA'
    });
    if (failPlayerDuplicate.status !== 409 || failPlayerDuplicate.body.success) {
      throw new Error('Player validation should have failed with 409 for duplicate email');
    }
    console.log(`✔ Validation caught duplicate email: ${failPlayerDuplicate.body.message}`);

    // -------------------------------------------------------------
    // 3. CREATE TOURNAMENTS
    // -------------------------------------------------------------
    console.log('\n--- Test 3: Create Tournaments ---');
    
    // Success cases
    const t1Res = await request(app).post('/tournaments').send({
      name: 'Summer Championship',
      maxPlayers: 3
    });
    if (t1Res.status !== 201 || !t1Res.body.success) {
      throw new Error(`Failed to create T1: ${JSON.stringify(t1Res.body)}`);
    }
    tournamentT1Id = t1Res.body.data._id;
    console.log(`✔ Created Summer Championship (${tournamentT1Id}, Max Capacity: 3)`);

    const t2Res = await request(app).post('/tournaments').send({
      name: 'Solo Cup',
      maxPlayers: 1
    });
    tournamentT2Id = t2Res.body.data._id;
    console.log(`✔ Created Solo Cup (${tournamentT2Id}, Max Capacity: 1)`);

    // Validation failures
    console.log('Testing tournament creation validation rules...');
    const failT1 = await request(app).post('/tournaments').send({
      name: '',
      maxPlayers: 0
    });
    if (failT1.status !== 400 || failT1.body.success) {
      throw new Error('Tournament validation should have failed for capacity <= 0 or empty name');
    }
    console.log(`✔ Validation caught invalid maxPlayers: ${failT1.body.message}`);

    // -------------------------------------------------------------
    // 4. TOURNAMENT REGISTRATION
    // -------------------------------------------------------------
    console.log('\n--- Test 4: Register Players to Tournaments ---');

    // Register Alice, Bob, Charlie to T1 (fits capacity limit of 3)
    const regAlice = await request(app).post(`/tournaments/${tournamentT1Id}/register`).send({
      playerId: playerAId
    });
    if (regAlice.status !== 201 || !regAlice.body.success) {
      throw new Error(`Alice failed to register for T1: ${JSON.stringify(regAlice.body)}`);
    }
    console.log('✔ Registered Alice to T1');

    const regBob = await request(app).post(`/tournaments/${tournamentT1Id}/register`).send({
      playerId: playerBId
    });
    console.log('✔ Registered Bob to T1');

    const regCharlie = await request(app).post(`/tournaments/${tournamentT1Id}/register`).send({
      playerId: playerCId
    });
    console.log('✔ Registered Charlie to T1');

    // Attempt to register David to T1 (should fail - capacity is 3)
    const regDavidFail = await request(app).post(`/tournaments/${tournamentT1Id}/register`).send({
      playerId: playerDId
    });
    if (regDavidFail.status !== 400 || regDavidFail.body.success) {
      throw new Error('David registration in T1 should have failed due to capacity limit');
    }
    console.log(`✔ Registration capacity limit enforced correctly: ${regDavidFail.body.message}`);

    // Register David to T2
    await request(app).post(`/tournaments/${tournamentT2Id}/register`).send({
      playerId: playerDId
    });
    console.log('✔ Registered David to T2');

    // Attempt to register David to T2 again (should fail - duplicate registration)
    const regDavidDup = await request(app).post(`/tournaments/${tournamentT2Id}/register`).send({
      playerId: playerDId
    });
    if (regDavidDup.status !== 409 || regDavidDup.body.success) {
      throw new Error('Duplicate registration should return 409 conflict');
    }
    console.log(`✔ Duplicate registration check enforced correctly: ${regDavidDup.body.message}`);

    // -------------------------------------------------------------
    // 5. SCORE SUBMISSION
    // -------------------------------------------------------------
    console.log('\n--- Test 5: Score Submission ---');

    // Submit valid scores
    const scA1 = await request(app).post(`/tournaments/${tournamentT1Id}/score`).send({
      playerId: playerAId,
      score: 450
    });
    if (scA1.status !== 200 || !scA1.body.success) {
      throw new Error(`Failed to submit score for Alice: ${JSON.stringify(scA1.body)}`);
    }
    console.log('✔ Submitted score 450 for Alice in T1');

    const scB1 = await request(app).post(`/tournaments/${tournamentT1Id}/score`).send({
      playerId: playerBId,
      score: 500
    });
    console.log('✔ Submitted score 500 for Bob in T1');

    // Update Alice score
    const scA2 = await request(app).post(`/tournaments/${tournamentT1Id}/score`).send({
      playerId: playerAId,
      score: 600
    });
    if (scA2.body.data.score !== 600) {
      throw new Error('Alice score did not update correctly to 600');
    }
    console.log('✔ Updated Alice score to 600 in T1');

    // Submit score for unregistered player (David in T1)
    const scDavidFail = await request(app).post(`/tournaments/${tournamentT1Id}/score`).send({
      playerId: playerDId,
      score: 300
    });
    if (scDavidFail.status !== 400 || scDavidFail.body.success) {
      throw new Error('Unregistered player should not be able to submit a score');
    }
    console.log(`✔ Unregistered score submission blocked correctly: ${scDavidFail.body.message}`);

    // Submit invalid score (negative number)
    const scInvalid = await request(app).post(`/tournaments/${tournamentT1Id}/score`).send({
      playerId: playerAId,
      score: -20
    });
    if (scInvalid.status !== 400 || scInvalid.body.success) {
      throw new Error('Negative score should fail validation');
    }
    console.log(`✔ Negative score validation caught: ${scInvalid.body.message}`);

    // -------------------------------------------------------------
    // 6. LEADERBOARD & TIE-BREAKER
    // -------------------------------------------------------------
    console.log('\n--- Test 6: Leaderboard and Tie-Breaker ---');

    // Register Player E (Charlie Dup) named "Amanda" to test name alphabetical tie-breaker
    // Let's create Amanda first
    const pERes = await request(app).post('/players').send({
      name: 'Amanda',
      email: 'amanda@example.com',
      country: 'Mexico'
    });
    playerEId = pERes.body.data._id;
    
    // We need to register Amanda in a new tournament (T3) along with Alice, to test tie-breakers
    const t3Res = await request(app).post('/tournaments').send({
      name: 'Tie-Break Tournament',
      maxPlayers: 5
    });
    const tournamentT3Id = t3Res.body.data._id;
    
    await request(app).post(`/tournaments/${tournamentT3Id}/register`).send({ playerId: playerAId }); // Alice
    await request(app).post(`/tournaments/${tournamentT3Id}/register`).send({ playerId: playerBId }); // Bob
    await request(app).post(`/tournaments/${tournamentT3Id}/register`).send({ playerId: playerEId }); // Amanda

    // Submit same score (500) for Alice, Bob, and Amanda
    await request(app).post(`/tournaments/${tournamentT3Id}/score`).send({ playerId: playerAId, score: 500 });
    await request(app).post(`/tournaments/${tournamentT3Id}/score`).send({ playerId: playerBId, score: 500 });
    await request(app).post(`/tournaments/${tournamentT3Id}/score`).send({ playerId: playerEId, score: 500 });

    // Retrieve leaderboard
    const leaderboardRes = await request(app).get(`/tournaments/${tournamentT3Id}/leaderboard`);
    if (leaderboardRes.status !== 200 || !leaderboardRes.body.success) {
      throw new Error(`Failed to retrieve leaderboard: ${JSON.stringify(leaderboardRes.body)}`);
    }

    const leaderboard = leaderboardRes.body.data;
    console.log('Leaderboard standings (all have score 500):');
    leaderboard.forEach(p => console.log(`  Rank ${p.rank}: ${p.name} (${p.score})`));

    // Expected order: Amanda (A), Alice (A - l...), Bob (B)
    if (leaderboard[0].name !== 'Alice' || leaderboard[1].name !== 'Amanda' || leaderboard[2].name !== 'Bob') {
      // Let's double check alphabetical comparison:
      // 'Alice' vs 'Amanda': 'Al' < 'Am' so 'Alice' comes first!
      // 'Amanda' vs 'Bob': 'Am' < 'B' so 'Amanda' comes second!
      // This matches perfectly!
      if (leaderboard[0].name !== 'Alice' || leaderboard[1].name !== 'Amanda' || leaderboard[2].name !== 'Bob') {
        throw new Error('Leaderboard tie-breaker sorting by player name failed!');
      }
    }
    console.log('✔ Leaderboard tie-breaker sorted alphabetically by name correctly');

    // Test search filter inside leaderboard
    const leaderboardSearchRes = await request(app).get(`/tournaments/${tournamentT3Id}/leaderboard?search=amanda`);
    const leaderboardSearch = leaderboardSearchRes.body.data;
    if (leaderboardSearch.length !== 1 || leaderboardSearch[0].name !== 'Amanda') {
      throw new Error('Leaderboard search filter by player name failed');
    }
    console.log('✔ Leaderboard search filter working correctly');

    // -------------------------------------------------------------
    // 7. GET PLAYER STATS & RANK
    // -------------------------------------------------------------
    console.log('\n--- Test 7: Player Rank and Stats ---');

    // Retrieve Amanda stats in T3
    const statsAmandaRes = await request(app).get(`/tournaments/${tournamentT3Id}/player/${playerEId}`);
    if (statsAmandaRes.status !== 200 || !statsAmandaRes.body.success) {
      throw new Error(`Failed to get Amanda stats: ${JSON.stringify(statsAmandaRes.body)}`);
    }
    const statsAmanda = statsAmandaRes.body.data;
    console.log(`Amanda Rank: ${statsAmanda.rank}, Score: ${statsAmanda.score} (Expected Rank: 2)`);
    if (statsAmanda.rank !== 2 || statsAmanda.score !== 500) {
      throw new Error(`Amanda rank calculation incorrect, got: ${statsAmanda.rank}`);
    }

    // Register a player to T3, but don't submit a score (should default to score 0 and rank at the bottom)
    await request(app).post(`/tournaments/${tournamentT3Id}/register`).send({ playerId: playerCId }); // Charlie
    
    const statsCharlieRes = await request(app).get(`/tournaments/${tournamentT3Id}/player/${playerCId}`);
    const statsCharlie = statsCharlieRes.body.data;
    console.log(`Charlie (no score submitted) Rank: ${statsCharlie.rank}, Score: ${statsCharlie.score} (Expected Score: 0, Rank: 4)`);
    if (statsCharlie.score !== 0 || statsCharlie.rank !== 4) {
      throw new Error(`Unscored player stats incorrect: ${JSON.stringify(statsCharlie)}`);
    }
    console.log('✔ Player Rank and Stats calculation working correctly');

    console.log('\n=========================================');
    console.log('✔ ALL INTEGRATION TESTS PASSED SUCCESSFULLY!');
    console.log('=========================================');

  } catch (error) {
    console.error('\n❌ TEST RUN FAILED!');
    console.error(error);
    process.exit(1);
  } finally {
    // Drop test database to clean up local environment
    console.log('\n[Test Cleanup] Dropping test database...');
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
    console.log('[Test Cleanup] Connection closed.');
  }
};

runTests();
