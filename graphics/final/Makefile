all: mazegen.js drawmaze2d.js

mazegen.js: mazegen.ts
	tsc mazegen.ts 

drawmaze2d.js: drawmaze2d.ts mazegen.ts
	tsc drawmaze2d.ts 

clean:
	rm mazegen.js drawmaze2d.js
