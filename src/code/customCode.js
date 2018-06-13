// export default `
// var player = world.players[playerNum-1];
// var closestGem = false;
// var closest;
// world.stones.forEach(stone => {
// 	if(closestGem===false)
// 		closestGem = stone;
// 	else if(
// 		Math.abs(Math.sqrt(closestGem.x*closestGem.x+closestGem.y*closestGem.y)-Math.sqrt(player.x*player.x+player.y*player.y))>
// 		Math.abs(Math.sqrt(stone.x*stone.x+stone.y*stone.y)-Math.sqrt(player.x*player.x+player.y*player.y))
// 	){
// 		closestGem = stone;
// 	}
// });
// if(closestGem){
// 	if(closestGem.x-player.x>10){
// 		var direction = {left:false, right:true, up:false, down:false};
// 	}
// 	else if(closestGem.x-player.x<-10){
// 		var direction = {left:true, right:false, up:false, down:false};
// 	}
// 	else if(closestGem.y-player.y>10){
// 		var direction = {left:false, right:false, up:false, down:true};
// 	}
// 	else if(closestGem.y-player.y<-10){
// 		var direction = {left:false, right:false, up:true, down:false};
// 	}
// 	return direction;
// }
// `;
export default `import random\ndef getPyPlayersCommands(world, playerNum):\n\tprint(window.JSON.stringify(world))\n\tprint(playerNum)\n\tfoo = ['RIGHT', 'LEFT', 'UP','DOWN']\n\tresult = random.choice(foo)\n\tprint(result)\n\treturn result`;
