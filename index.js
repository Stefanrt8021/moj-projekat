const fs = require('fs');

function loadJSON(path) {
    return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

const groups = loadJSON('./groups.json');

function generateMatchResult(teamA, teamB) {
    const rnd = Math.random;

    const rankingDifference = teamA.FIBARanking - teamB.FIBARanking;

    let scoreA = Math.floor(rnd() * 20) + 80 + Math.floor(rankingDifference / 10);
    let scoreB = Math.floor(rnd() * 20) + 80 - Math.floor(rankingDifference / 10);
    return [scoreA,scoreB];
}

function simulateGroupMatches(groups) {
    const groupResults = {};

    for (const groupKey in groups) {
        const teams = groups[groupKey];
        groupResults[groupKey] = teams.map(team => ({
            ...team,
            points: 0,
            scored: 0,
            conceded: 0,
            wins: 0,
            losses: 0,
        }));

        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                const [scoreA, scoreB] = generateMatchResult(teams[i], teams[j]);

                groupResults[groupKey][i].scored += scoreA;
                groupResults[groupKey][i].conceded += scoreB;
                groupResults[groupKey][j].scored += scoreB;
                groupResults[groupKey][j].conceded += scoreA;

                if (scoreA > scoreB) {
                    groupResults[groupKey][i].points += 2;
                    groupResults[groupKey][i].wins++;
                    groupResults[groupKey][j].points += 1;
                    groupResults[groupKey][j].losses++;
                } else if(scoreA < scoreB){
                    groupResults[groupKey][i].points += 1;
                    groupResults[groupKey][i].losses++;
                    groupResults[groupKey][j].points += 2;
                    groupResults[groupKey][j].wins++;
                }
                console.log(`Grupa ${groupKey}: \n${teams[i].Team} - ${teams[j].Team} (${scoreA} : ${scoreB})`);
            }
        }
    }

    return groupResults;
}

function rankTeams(groups) {
    for (const groupKey in groups) {
        groups[groupKey].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            const pointDiffA = a.scored - a.conceded;
            const pointDiffB = b.scored - b.conceded;
            if (pointDiffB !== pointDiffA) return pointDiffB - pointDiffA;
            return b.scored - a.scored;
        });
    }

    return groups;
}

function createDraw(groups) {
    const ranks = [];
    for (const groupKey in groups) {
        ranks.push(groups[groupKey][0]);
        ranks.push(groups[groupKey][1]);
        ranks.push(groups[groupKey][2]);
    }

    ranks.sort((a, b) => b.points - a.points || (b.scored - b.conceded) - (a.scored - a.conceded));

    const potD = [ranks[0], ranks[1]];
    const potE = [ranks[2], ranks[3]];
    const potF = [ranks[4], ranks[5]];
    const potG = [ranks[6], ranks[7]];

    console.log('\nŠeširi:');
    console.log('Šešir D', potD.map(team => team.Team));
    console.log('Šešir E', potE.map(team => team.Team));
    console.log('Šešir F', potF.map(team => team.Team));
    console.log('Šešir G', potG.map(team => team.Team));

    const quarterFinals = [
        [potD[0], potG[1]],
        [potD[1], potG[0]],
        [potE[0], potF[1]],
        [potE[1], potF[0]],
    ];

    console.log('\nEliminaciona faza:');
    const semiFinals = [];
    quarterFinals.forEach((match, i) => {
        const [teamA, teamB] = match;
        const [scoreA, scoreB] = generateMatchResult(teamA, teamB);
        console.log(`${teamA.Team} - ${teamB.Team} (${scoreA} : ${scoreB})`);
        semiFinals.push(scoreA > scoreB ? teamA : teamB);
    });

    const finalMatchup = [
        [semiFinals[0], semiFinals[1]],
        [semiFinals[2], semiFinals[3]]
    ];
    const finalists = [];
    console.log('\nPolufinale:');
    finalMatchup.forEach((match, i) => {
        const [teamA, teamB] = match;
        const [scoreA, scoreB] = generateMatchResult(teamA, teamB);
        console.log(`${teamA.Team} - ${teamB.Team} (${scoreA} : ${scoreB})`);
        finalists.push(scoreA > scoreB ? teamA : teamB);
    });

    const thirdPlaceMatchup = [
        [semiFinals[0] === finalists[0] ? semiFinals[1] : semiFinals[0], semiFinals[2] === finalists[0] ? semiFinals[3] : semiFinals[2]],
    ];

    thirdPlaceMatchup.forEach((match, i) => {
        const [teamA, teamB] = match;
        const [scoreA, scoreB] = generateMatchResult(teamA, teamB);
        console.log(`Utakmica za treće mesto: ${teamA.Team} - ${teamB.Team} (${scoreA} : ${scoreB})`);
        const thirdPlace = scoreA > scoreB ? teamA : teamB;
        console.log(`Treće mesto osvaja: ${thirdPlace.Team}`);
    });
    console.log('\nFinale:');
    const [scoreA, scoreB] = generateMatchResult(finalists[0], finalists[1]);
    console.log(`${finalists[0].Team} - ${finalists[1].Team} (${scoreA} : ${scoreB})`);
    console.log(`\nZlato osvaja: ${scoreA > scoreB ? finalists[0].Team : finalists[1].Team}`);
}

let groupResults = simulateGroupMatches(groups);
groupResults = rankTeams(groupResults);

console.log('Konačan plasman u grupama:');
for (const groupKey in groupResults) {
    console.log(`Grupa ${groupKey}:`);
    groupResults[groupKey].forEach((team, index) => {
        console.log(`${index + 1}. ${team.Team} (${team.wins} / ${team.losses} / ${team.points} / ${team.scored} / ${team.conceded} / ${team.scored - team.conceded})`);
    });
}

createDraw(groupResults);
