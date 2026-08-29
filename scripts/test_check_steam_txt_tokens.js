import fs from 'fs';

const steamTxtPath = 'C:\\Users\\iliyk\\Desktop\\steam.txt';
const steamTxt = fs.readFileSync(steamTxtPath, 'utf8');

const tokensInTxt = steamTxt.match(/7656119\d+----ey[A-Za-z0-9_\-.]+/g) || [];
console.log('Total tokens currently in steam.txt:', tokensInTxt.length);

const idsInTxt = new Set(tokensInTxt.map(t => t.split('----')[0]));
console.log('Steam IDs in steam.txt:', [...idsInTxt]);

// Let's check our new tokens
const newTokens = [
  '76561199621492593----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTYyMTQ5MjU5MyIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE3ODg5MjM1NjEsICJuYmYiOiAxNzYyMDc3NjM3LCAiaWF0IjogMTc3MDcxNzYzNywgImp0aSI6ICIwMDEzXzI3QUMyN0MyXzQ2N0I2IiwgIm9hdCI6IDE3NzA3MTc2MzcsICJwZXIiOiAxLCAiaXBfc3ViamVjdCI6ICIxNzguMjE0LjI1NC44IiwgImlwX2NvbmZpcm1lciI6ICIyMy4yNTEuMzUuNzIiIH0.E7fXi5A5R1M8yzVFZfBPyV_8IPVdS9ofxJe8nG6IL_ew6Lc5sQK2U2mP1TsBNQ5x-esgUQ5EsaIW_22G_u5rAw',
  '76561199388511036----eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyAiaXNzIjogInN0ZWFtIiwgInN1YiI6ICI3NjU2MTE5OTM4ODUxMTAzNiIsICJhdWQiOiBbICJjbGllbnQiLCAid2ViIiwgInJlbmV3IiwgImRlcml2ZSIgXSwgImV4cCI6IDE4MDA5NjUzNzAsICJuYmYiOiAxNzU3Njk4OTE2LCAiaWF0IjogMTc2NjMzODkxNiwgImp0aSI6ICIwMDA1XzI3NkI4RUI2X0YxMzhFIiwgIm9hdCI6IDE3NjYzMzg5MTYsICJnZW4iOiAxLCAicGVyIjogMSwgImlwX3N1YmplY3QiOiAiODYuMjIuMjU0LjE4NiIsICJpcF9jb25maXJtZXIiOiAiODYuMjIuMjU0LjE4NiIgfQ.kRJOFgXVqvKhsmcKnOqlEasWDA_UlHUc36NgIy8ijf60W65uLNYiDalzwDGp8-z0Hv1PxMOtyU5orXwbwW3mDA'
];

for (const t of newTokens) {
  const id = t.split('----')[0];
  console.log(`Is new token ${id} in steam.txt?`, idsInTxt.has(id));
}
