var width = 371,    //width of canvas 
    height = 640,   //height of canvas
    gLoop,          //game loop logic boolean
    points = 0,
    state = true;

//set and get context of the html canvas
c = document.getElementById('c');
ctx = c.getContext('2d');           //2d graphic context of canvas
c.width = width;
c.height = height;

//clears the html canvas with a bright blue
var clear = function() {
    ctx.fillStyle = '#d0e7f9';      //set active color to #d0e
    ctx.beginPath();
    
    ctx.rect(0, 0, width, height);  //draw a rectange from 0, 0 to w, h
    ctx.closePath();
    ctx.fill();
};

/* ======================================================================================================= */
/* Sounds! */
var backgroundMusic = new Audio('res/sml.ogg');
var gameOverMusic = new Audio('res/gameover.mp3');
var jumpSound = new Audio('res/jump.wav');

//play the background music immediately
backgroundMusic.play();

/* ======================================================================================================= */
/* Drawn Clouds */ /*
var howManyCircles = 10, circles = [];

for (var i = 0; i < howManyCircles; i++) {
    //circles[i][0] : x-pos
    //circles[i][1] : y-pos
    //circles[i][2] : radius (0-100)
    //circles[i][3] : opacity
    circles.push([Math.random() * width, Math.random() * height, Math.random() * 100, Math.random() / 2]);
    //x, y pos. radius from 0-100, transparency from 0-0.5 where 0 is invisible and 1 is opaque
    
    var DrawCircles = function () {
        for (var i = 0; i < howManyCircles; i++) {
            ctx.fillStyle = 'rgba(255,255,255, ' + circles[i][3] + ')'; //white
            ctx.beginPath();
            ctx.arc(circles[i][0], circles[i][1], circles[i][2], 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
        }
    };
}

//illusion of moving clouds.
var MoveCircles = function(deltaY) {
    for (var i = 0; i < howManyCircles; i++) {
        if (circles[i][1] - circles[i][2] > height) {
            //circle under scream
            circles[i][0] = Math.random() * width;
            circles[i][2] = Math.random() * 100;
            circles[i][1] = 0 - circles[i][2];
            circles[i][3] = Math.random() / 2;
        } else {
            circles[i][1] += deltaY; //move circles deltaY downward
        }
        
    }
}; */
/* ======================================================================================================= */
/* Sprite based Clouds */
var howManyClouds = 10, clouds = [];
var cloudSprite = new Image(96, 48);
cloudSprite.src = 'res/bg_cloud.gif';

for (var i = 0; i < howManyClouds; i++) {
    clouds.push([Math.random() * width,         //x pos
                 Math.random() * height]);        //y pos
                 //Math.random() * 100,           //"radius"
                 //Math.random() / 2]);           //"opacity"
                 
    var DrawClouds = function() {
        for (var i = 0; i < howManyClouds; i++) {
            ctx.drawImage(cloudSprite, clouds[i][0], clouds[i][1]);
        }
    };   
}

//Moving the cloud strites
var MoveClouds = function(deltaY) {
    for(var i = 0; i < howManyClouds; i++) {
        //if the sprite is under screen
        if (clouds[i][1] > height) {
            clouds[i][0] = Math.random() * width;
            clouds[i][1] = -48;
            //clouds[i][2] = Math.random() * 100;
            //clouds[i][3] = Math.random() / 2;
        } else {
            clouds[i][1] += deltaY;
        }
    }
}


/* ======================================================================================================= */
/* Player Character */

var player = new (function() {
   var that = this;
   that.image = new Image();
   that.image.src = "res/mario.png";
   
   that.frames = 1;
   that.actualFrame = 0;
   that.interval = 0;
   
   that.isJumping = false;
   that.isFalling = false;
   that.jumpSpeed = 0;
   that.fallSpeed = 0;
   
   this.width = 64;
   that.height = 64;
   
   that.X = 0;
   that.Y = 0;
   
   that.setPosition = function(x, y) {
       that.X = x;
       that.Y = y;
   };
   
   that.jump = function() {
       if (!that.isJumping && !that.isFalling) {
           that.fallSpeed = 0;
           that.isJumping = true;
           that.jumpSpeed = 17;
       }
   };
    
   that.checkJump = function() {
       
       if (that.Y > height * 0.4) {
           that.setPosition(that.X, that.Y - that.jumpSpeed);
           jumpSound.play();
       } else {
            if (that.jumpSpeed > 10) {
                points++;
            }
            //MoveCircles(that.jumpSpeed * 0.5);
            MoveClouds(that.jumpSpeed * 0.5);
            
            platforms.forEach(function(platform, ind) {
                platform.y += that.jumpSpeed;
                
                if (platform.y > height) {
                    var type = ~~(Math.random() * 5);
                    if (type == 0)
                        type = 1;
                    else
                        type = 0;
                    platforms[ind] = new PlatformSprite(Math.random() * (width - platformWidth), platform.y - height, type);
                }
            });
           
       }
       
       //that.setPosition(that.X, that.Y - that.jumpSpeed);
       that.jumpSpeed--;
       
       if (that.jumpSpeed ==0) {
           //start falling
           that.isJumping = false;
           that.isFalling = true;
           that.fallSpeed = 1;
       }
   };
   
      that.fallStop = function() {
       //stop falling, start jumping again
       that.isFalling = false;
       that.fallSpeed = 0;
       that.jump();
   };
   
    that.checkFall = function() {
       if (that.Y < height - that.height) {
           //check if object collides on the screen bottom
           //if not, make gravity stronger
           that.setPosition(that.X, that.Y + that.fallSpeed);
           that.fallSpeed++;
       } else {
           //if collision
            if (points == 0)
                that.fallStop();
            else
                GameOver();
       }
   };
   
   that.moveLeft = function() {
       if (that.X > 0 ) {
           that.setPosition(that.X - 5, that.Y);
       }
   };
   
   that.moveRight = function() {
       if (that.X + that.width < width) {
           that.setPosition(that.X + 5, that.Y);
       }
   }
   
   that.interval = 0;
   
   that.draw = function() {
     try {
         ctx.drawImage(that.image, 0, that.height * that.actualFrame, 
            that.width, that.height, that.X, that.Y, that.width, that.height);
         //Image Obj, source X, source Y, src w, src h, desintation x, dest y, dest width, dest height
         //cut and paste iamge into destination one
     }  catch(e) {
         //if image is too big, js will throw an error
         if (that.interval == 4) {
             if (that.actualFrame == that.frame) {
                 that.actualFrame = 0;
             } else {
                 that.actualFrame++;
             }
             that.interval = 0;
         }
         that.interval++;
     }
   };
   
})();

player.setPosition(~~((width-player.width)/2), ~~((height - player.height)/2));
player.jump();
//~~ lower int form. move player to center of the screen.

/* ======================================================================================================= */
//mouse moves mario!
document.onmousemove = function(e) {
    if (player.X + c.offsetLeft > e.pageX) {
        player.moveLeft();
    } else if (player.X + c.offsetLeft < e.pageX) {
        player.moveRight();
    }
};

/* ======================================================================================================= */
//touch moves mario
c.addEventListener('touchmove', function(event) {
   //if one finger inside this element
   if (event.targetTouches.length == 1) {
       //move mario where the finger was
       if (player.X + c.offsetLeft > event.pageX) {
           player.moveLeft();
       } else if (player.X + c.offsetLeft < event.pageX) {
           player.moveRight();
       }
   } 
}, false);

/* ======================================================================================================= */
//platforms and collisions
var numOfPlatforms = 7,
    platforms = [],
    platformWidth = 70,
    platformHeight = 20;

var spritePlatformWidth = 96,
    spritePlatformHeight = 16;

/* ======================================================================================================= */
//Sprite based platforms with collisions 
var PlatformSprite = function(x, y, type) {
    var bubblePlatform = new Image(96, 16);
    bubblePlatform.src = 'res/bubble_platform.gif';
    var steelPlatform = new Image(96,16);
    steelPlatform.src = 'res/steel_platform.gif';
      
    this.onCollide = function() {
      player.fallStop();  
    };
       
    this.x = ~~x;
    this.y = y;
    this.type = type;
    
    //type 1 is the super bouncey platform
    if (type === 1) {
        this.onCollide = function() {
            player.fallStop();
            player.jumpSpeed = 50;
        }
    }
    
    this.isMoving = ~~(Math.random() * 2);              //Math.floor(Math.ran...)
    this.direction = ~~(Math.random() *2) ? -1 : 1;     //Also makes float -> int
    
    this.draw = function() {
        if (type == 1) 
            ctx.drawImage(bubblePlatform, this.x, this.y);
        else 
            ctx.drawImage(steelPlatform, this.x, this.y);
    };
    return this;
};

/* ======================================================================================================= */
//Canvas based platforms with collisions
/*
var Platform = function(x, y, type) {
    var that = this;
    
    that.firstColor = '#ff8c00';
    that.secondColor = '#eeee00';
    
    that.onCollide = function() {
        player.fallStop();
    };
    
    if (type === 1) {
        that.firstColor = '#aadd00';
        that.secondColor = '#698822';
        
        that.onCollide = function() {
            player.fallStop();
            player.jumpSpeed = 50;
        };
    }
    
    that.x = ~~x;
    that.y = y;
    that.type = type;
    
    that.isMoving = ~~(Math.random() * 2);;
    that.direction = ~~(Math.random() * 2) ? -1 : 1;
    
    that.draw = function() {
        ctx.fillStyle = 'rgba(255,255,255,1)';
        var gradient = ctx.createRadialGradient(that.x + (platformWidth/2), 
            that.y + (platformHeight/2), 5, 
            that.x + (platformWidth/2), 
            that.y + (platformHeight/2), 45);
        gradient.addColorStop(0, that.firstColor);
        gradient.addColorStop(1, that.secondColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(that.x, that.y, platformWidth, platformHeight);
    };
    
    return that;
}; */
/* =======================================================================================================
// platform logic
var generatePlatforms = function() {
    var position = 0,
        type;
        
    for (var i = 0; i < numOfPlatforms; i++) {
        type = ~~(Math.random()*5);
        if (type == 0)
            type = 1;
        else
            type = 0;
        platforms[i] = new Platform(Math.random() * (width - platformWidth), position, type);
        
        if (position < height - platformHeight)
            position += ~~(height / numOfPlatforms);
    }
}();

var checkCollision = function() {
    platforms.forEach(function(e, ind) {
        if (
            (player.isFalling) &&
            (player.X < e.x + platformWidth) &&
            (player.X + player.width > e.x) &&
            (player.Y + player.height > e.y) &&
            (player.Y + player.height < e.y + platformHeight)
        ) { e.onCollide(); }
    });
}; */
/* ======================================================================================================= */
// sprite platform logic
var generateSpritePlatforms = function() {
    var position = 0,
        type;
        
    for (var i = 0; i < numOfPlatforms; i++) {
        type = ~~(Math.random() * 5);
        
        if (type == 0)
            type = 1;
        else
            type = 0;
        platforms[i] = new PlatformSprite(Math.random() * (width - spritePlatformWidth), position, type);
        
        if (position < height - spritePlatformHeight)
            position += ~~(height / numOfPlatforms);
    }
}();

var checkSpriteCollision = function() {
    platforms.forEach(function(e, ind) {
        if (
            (player.isFalling) &&
            (player.X < e.x + spritePlatformWidth) &&
            (player.X + player.width > e.x) &&
            (player.Y + player.height > e.y) &&
            (player.Y + player.height < e.y + spritePlatformHeight)
        ) { e.onCollide(); }
    });
};

/* ======================================================================================================= */
/* MAIN GAME LOOP */
var GameLoop = function() {
    clear();
    
    //MoveCircles(5);
    //DrawCircles();
    DrawClouds();
    
    player.draw();
    
    if (player.isJumping) player.checkJump();
    if (player.isFalling) player.checkFall();
    
    platforms.forEach(function(platform, index) {
        if (platform.isMoving) {
            if (platform.x < 0) {
                platform.direction = 1;
            } else if (platform.x > width - platformWidth) {
                platform.direction = -1;
            }
            platform.x += platform.direction * (index / 2) * ~~(points / 100);
        }
        platform.draw();
    });
    
    checkSpriteCollision();
    
    ctx.fillStyle = "Black";
    ctx.fillText("Jumps:" + points, 10, height-10);
    
    if (state)
        gLoop = setTimeout(GameLoop, 1000/50);
}

/* ======================================================================================================= */
/* Game Over State */
var GameOver = function() {
    backgroundMusic.pause();
    gameOverMusic.play();
    state = false;
    clearTimeout(gLoop);
    setTimeout(function() {
        clear();
        ctx.fillStyle = "Black";
        ctx.font = "12pt Arial";
        ctx.fillText("Game Over!", width / 2 - 60, height / 2 - 50);
        ctx.fillText("Your total jumps:" + points, width/2-60, height/2-30);
    }, 100);
};

GameLoop();