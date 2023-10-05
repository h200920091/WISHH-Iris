let Variables = require("./gameGlobalVariable");

const Input = {};
cc.Class({
    extends: cc.Component,

    properties: {
        audio: {
            default: [],
            type: cc.AudioClip
        },
        lightPrefab: cc.Prefab,
        ghostPrefab: cc.Prefab,
        snowBallPerfab: cc.Prefab,
        enterMyName: cc.Prefab,
        deadChangeScene: cc.Prefab,
        playerShadow: cc.Node,
        colorShow: cc.Node,
        colorBar: cc.Node,
        redBar: cc.Prefab,
        blueBar: cc.Prefab,
        yellowBar: cc.Prefab,
        fireBall: cc.Prefab,
        redMP:cc.Node,
        blueMP:cc.Node,
        yellowMP:cc.Node,
        final: cc.Node,
        enemies: cc.Node,
        orangeEffect: cc.Prefab,
        purpleEffect: cc.Prefab,
        respawnPoint: cc.Vec2, //復活座標

        new_redBar: cc.Node,
        new_blueBar: cc.Node,
        new_yellowBar: cc.Node,
        new_redButton: cc.Node,
        new_blueButton: cc.Node,
        new_yellowButton: cc.Node,

        UI_blue: cc.Node,
        UI_red: cc.Node,
        UI_yellow: cc.Node,
        UI_orange: cc.Node,
        UI_green: cc.Node,
        UI_purple: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad () 
    {  
        this.redMagicPoint = 10;//red mp
        this.blueMagicPoint = 10;//blue mp
        this.yellowMagicPoint = 10;//yellow mp
        Variables.purpleAmount = 0;
        this.playerHP = 3;
        this.setMP();
        this.canMove = true;
        this.dashForce = 1000000;
        this.jumpForce = 180000;
        this.slideSpeed = 250;
        this.canJump = true;
        this.jumpCount = 2; //Counting jump
        this.red = false;
        this.blue = false;
        this.yellow = false;
        this._speed = 350;
        this.sp = cc.v2(0,0);//current speed
        this.rb = this.node.getComponent(cc.RigidBody);
        this.anima = 'idle';
        this.playerAni = this.node.getComponent(cc.Animation);
        this.playerAni.on('finished', this.onAnimaFinished, this);
        this.isOnGround = false;
        this.onWall = false;
        this.isDead = false;
        this.pushingWall = false;
        this.isDashing = false;
        this.wallSide = -1; //判斷目前貼的是左邊還是右邊 右邊:-1 左邊: 1
        this.isAttacking = false;
        this.greening = false;
        this.respawning = false;
        this.entering = false;
        this.respawnPoint = cc.v2(-327,-191); //預設復活座標
        cc.systemEvent.on('keydown', this.onKeydown, this);
        cc.systemEvent.on('keyup', this.onKeyup, this);
    },
    onDestroy()
    {
        this.playerAni.off('finished', this.onAnimaFinished, this);
        cc.systemEvent.off('keydown', this.onKeydown, this);
        cc.systemEvent.off('keyup', this.onKeyup, this);
    },
    //start () {},

    colorCoolDown(color) //使用完顏色冷卻
    {
        if(color == 1) //Red
        {
            this.nodeSetAni(this.new_redBar,'redBar_refill');
            this.scheduleOnce(function(){this.nodeSetAni(this.new_redButton,'redButton_up');},2);
            this.redMagicPoint = 0;
            this.setMP();
            this.schedule(function() {
                this.redMagicPoint++;
                this.setMP();
            }, 0.2, 9, 0); //(間隔時間 , 重複次數 , 一開始延遲時間)
        }
        else if(color == 2) //Blue
        {
            this.nodeSetAni(this.new_blueBar,'blueBar_refill');
            this.scheduleOnce(function(){this.nodeSetAni(this.new_blueButton,'blueButton_up');},2);
            this.blueMagicPoint = 0;
            this.setMP();
            this.schedule(function() {
                this.blueMagicPoint++;
                this.setMP();
            }, 0.2, 9, 0);
        }
        else if(color == 3) //Yellow
        {
            this.nodeSetAni(this.new_yellowBar,'yellowBar_refill');
            this.scheduleOnce(function(){this.nodeSetAni(this.new_yellowButton,'yellowButton_up');},2);
            this.yellowMagicPoint = 0;
            this.setMP();
            this.schedule(function() {
                this.yellowMagicPoint++;
                this.setMP();
            }, 0.2, 9, 0);
        }
    },

    onAnimaFinished(e, data)
    {
        if(data.name == 'fire')
        {
            this.setAni('idle');
            this.isAttacking = false;
        }
        else if(data.name == 'light')
        {
            this.setAni('idle');
            this.isAttacking = false;
        }else if(data.name == 'ice')
        {
            this.setAni('idle');
            this.isAttacking = false;
        }
        else if(data.name == 'orange')
        {
            this.setAni('idle');
            this.isAttacking = false;
        }
        else if(data.name == 'player_die')
        {
            //this.setAni('idle');
        }
        else if(data.name == 'purple')
        {
            this.setAni('idle');
            this.isAttacking = false;
        }
        else if(data.name == 'green')
        {
            this.setAni('idle');
            this.isAttacking = false;
            this.greening = false;
        }
        else
        {
            this.setAni('idle');
        }
    },

    setAni(anima)
    {
        if(this.anima == anima)
            return;
        this.playerAni.stop();
        this.anima = anima;
        this.playerAni.play(anima);
    },

    nodeSetAni(otherNode,anima)
    {
        otherNode.getComponent(cc.Animation).stop();
        otherNode.getComponent(cc.Animation).play(anima);
    },

    onKeydown(e)
    {
        Input[e.keyCode] = 1;
        switch(e.keyCode) {
            case cc.macro.KEY.enter:
                if(1)
                {   
                    //cc.director.loadScene("menuScence");
                }
                break;
            case cc.macro.KEY.k:
                if(this.yellowMagicPoint >= 10 && this.canMove)
                {
                    this.nodeSetAni(this.new_yellowButton,'yellowButton_down');
                    if(!this.yellow) this.nodeSetAni(this.new_yellowBar,'yellowBar_use');
                    this.yellow = true;
                }
                break;
            case cc.macro.KEY.j:
                if(this.redMagicPoint >= 10 && this.canMove)
                {
                    this.nodeSetAni(this.new_redButton,'redButton_down');
                    if(!this.red) this.nodeSetAni(this.new_redBar,'redBar_use');
                    this.red = true;
                }
                break;
            case cc.macro.KEY.l:
                if(this.blueMagicPoint >= 10 && this.canMove)
                {
                    this.nodeSetAni(this.new_blueButton,'blueButton_down');
                    if(!this.blue) this.nodeSetAni(this.new_blueBar,'blueBar_use');
                    this.blue = true;
                }
                break;
            case cc.macro.KEY.r:
                if(!this.canMove)
                {
                    /*cc.tween(this.node)
                    .call(() => {
                        this.node.setPosition(this.respawnPoint.x, this.respawnPoint.y);
                        this.setAni('respawn');
                    }) 
                    .delay(1.67)
                    .call(() => {
                        this.canMove = true;
                        this.setAni('idle');
                        this.isAttacking = false;
                        this.isOnGround = true;
                        if(this.yellow) {
                            this.nodeSetAni(this.new_yellowBar,'yellowBar_refill');
                            this.scheduleOnce(function(){this.nodeSetAni(this.new_yellowButton,'yellowButton_up');},2);
                        }
                        if(this.red) {
                            this.nodeSetAni(this.new_redBar,'redBar_refill');
                            this.scheduleOnce(function(){this.nodeSetAni(this.new_redButton,'redButton_up');},2);
                        }
                        if(this.blue) {
                            this.nodeSetAni(this.new_blueBar,'blueBar_refill');
                            this.scheduleOnce(function(){this.nodeSetAni(this.new_blueButton,'blueButton_up');},2);
                        }
                        this.yellow = false;
                        this.red = false;
                        this.blue = false;
                    }) 
                    .start();*/
                }
                break;
        }  

    },

    onKeyup(e)
    { 
        Input[e.keyCode] = 0;
        switch(e.keyCode) {
            case cc.macro.KEY.w:
                this.canJump = true;
                break;
            case cc.macro.KEY.j:
                this.attack();
                break;
            case cc.macro.KEY.l:
                this.attack();
                break;
            case cc.macro.KEY.k:
                //cc.director.getCollisionManger().enabled = false;
                this.attack();
                break;
        }
    },

    onCollisionEnter(other, self)
    {
        if(other.node.name == "enemyFireBall" ||other.node.name == "effect_2" ||other.node.name == "wizard_effect_1" || other.node.name == "wizard" || other.node.name == "archer" || other.node.name == "arrow" || other.node.name == "laser" || other.node.name == "laserHalf" || other.node.name == "the_shot" || other.node.name =="sworder" || other.node.name =="bat" || other.node.name == "slime_attack_2_effect_1_0"
           || other.node.name == "NewFireBall" || other.node.name == "wizard_effect_2" || other.node.name == "Boss_wizard" || other.node.name == "wizard_effect_3_2") {
            this.dead();
        }
    },

    onBeginContact(contact, selfCollider, otherCollider){
        //cc.log(selfCollider.tag);
        //cc.log( otherCollider.node.name);
        if(selfCollider.tag === 1){
            this.isOnGround = true;
            this.jumpCount = 2;
            this.onWall = false;
        }
        else if(selfCollider.tag === 2){ //left
            this.onWall = true;
            this.jumpCount = 2;
            this.wallSide = 1;
        }
        else if(selfCollider.tag === 3){ //right
            this.onWall = true;
            this.jumpCount = 2;
            this.wallSide = -1;
        }
        else if((otherCollider.node.name == "enemyFireBall" ||otherCollider.node.name == "effect_2" || otherCollider.node.name == "wizard_effect_1" ||otherCollider.node.name == "slime_attack_2_effect_1_0" || otherCollider.node.name == "bat" || otherCollider.node.name == "sworder" || otherCollider.node.name == "spike" || otherCollider.node.name == "slime" ||
        otherCollider.node.name == "the_shot" || otherCollider.node.name == "wizard_effect_2" || otherCollider.node.name == "Boss_wizard") && this.node.group != "Invincible")
        {
            //if(!this.isDashing) cc.log('deadStatus'); else cc.log('undeadStatus');
            this.dead();
            cc.log("dead");
        }
        else if(otherCollider.node.name == "final")
        {
            cc.log("flag");
            var anim =this.final.getComponent(cc.Animation);
            anim.play("final");
        }
    },

    wallSlide()
    {
        /*this.lv = this.rb.linearVelocity;
        this.pushingWall = false;
        if((this.rb.linearVelocity.x>0 && this.wallSide==-1) || (this.rb.linearVelocity.x<0 && this.wallSide==1))
            this.pushingWall = true;
        var push = this.pushingWall ? 0: this.rb.linearVelocity.x;
        if(this.pushingWall){
        this.lv.x = push;
        this.lv.y = -this.slideSpeed;
        this.rb.linearVelocity = this.lv;
        }
        else this.onWall = false;*/
    },

    dash()
    {
        if(this.yellow){
            this.node.group = "Invincible";
            //this.node.color.fromHEX('#C3EA13');
            this.colorCoolDown(3);
            this.isDashing = true;
            //console.log(this.node.x,this.node.y);
            var light = cc.instantiate(this.lightPrefab);
            var dashDistance;
            light.x = this.node.x;
            light.y = this.node.y;
            this.lv = this.rb.linearVelocity;
            if(this.node.scaleX < 0)
            { 
                this.lv.x = -5000;
                light.scaleX *= -1; 
                //dashDistance = -300;
            }
            else if(this.node.scaleX > 0)
            {
                this.lv.x = 5000;
                //dashDistance = 300;
            }
            this.scheduleOnce(function(){ this.shakeEffect(0.2);this.lv.x = 0;this.rb.linearVelocity = this.lv;this.isAttacking = false;},0.05);
            this.playerShadow.addChild(light);
            this.lv.y = 0;
            this.rb.linearVelocity = this.lv;
            this.rb.gravityScale = 0;
            this.scheduleOnce(function(){ light.destroy();this.isDashing = false;cc.log("destroy");},0.83);
            this.scheduleOnce(function(){this.node.group = "Player";cc.log("I'm Player")},0.83);//this.node.color.fromHEX('#FFFFFF');
            this.scheduleOnce(function(){ this.isDashing = false;cc.log("stop");this.rb.gravityScale = 1;},0.1);
            //cc.log(this.lv.x)
            //this.rb.applyForceToCenter( cc.v2(this.dashForce,0) , true );
            //this.node.x += dashDistance;
            //cc.director.getPhysicsManager().gravity = cc.v2(0, -1000);   
            //this.ghost();
        }
 
        //this.rb.applyLinearImpulse(cc.v2(1000000,0),cc.v2(0,0),true)
    },

    dead()
    {
        if(this.canMove) {
            Variables.playerHP--;
            this.playerHP = Variables.playerHP;
        }
        this.setHP();
        this.canMove = false;
        Variables.playerCanMove = false;
        this.rb.linearVelocity.x = 0;
        this.rb.linearVelocity.y = 0;
        this.isDead = true;
        this.setAni('player_die');
    },

    ghost() 
    {
        cc.tween(this.node)
            .call(() => {
                var ghostChild = cc.instantiate(this.ghostPrefab);
                var ghostSprite = this.node.getComponent(cc.Sprite).spriteFrame;
                ghostChild.getComponent(cc.Sprite).spriteFrame = ghostSprite;
                ghostChild.x = this.node.x;
                ghostChild.y = this.node.y;
                this.playerShadow.addChild(ghostChild);
                console.log(ghostChild.x,ghostChild.y);
            })
            .delay(0.3)
            .call(() => {
                var ghostChild = cc.instantiate(this.ghostPrefab);
                var ghostSprite = this.node.getComponent(cc.Sprite).spriteFrame;
                ghostChild.getComponent(cc.Sprite).spriteFrame = ghostSprite;
                ghostChild.x = this.node.x;
                ghostChild.y = this.node.y;
                this.playerShadow.addChild(ghostChild);
                console.log(ghostChild.x,ghostChild.y);
            })
            .start();
    },

    color_detect()
    {
        //cc.log(this.red,this.blue,this.yellow);
        if(this.red && this.blue && this.yellow) {
            this.colorShow.color = cc.Color.WHITE;
            this.UI_blue.active = false;
            this.UI_red.active = false;
            this.UI_yellow.active = false;
            this.UI_orange.active = false;
            this.UI_green.active = false;
            this.UI_purple.active = false;
        }
        else if(this.red && !this.blue && !this.yellow) {
            this.colorShow.color = cc.Color.RED;
            this.UI_blue.active = false;
            this.UI_red.active = true;
            this.UI_yellow.active = false;
            this.UI_orange.active = false;
            this.UI_green.active = false;
            this.UI_purple.active = false;
        }
        else if(!this.red && this.blue && !this.yellow) {
            this.colorShow.color = cc.Color.BLUE;
            this.UI_blue.active = true;
            this.UI_red.active = false;
            this.UI_yellow.active = false;
            this.UI_orange.active = false;
            this.UI_green.active = false;
            this.UI_purple.active = false;
        }
        else if(!this.red && !this.blue && this.yellow) {
            this.colorShow.color = cc.Color.YELLOW;
            this.UI_blue.active = false;
            this.UI_red.active = false;
            this.UI_yellow.active = true;
            this.UI_orange.active = false;
            this.UI_green.active = false;
            this.UI_purple.active = false;
        }
        else if(this.red && this.blue && !this.yellow) {
            this.colorShow.color = new cc.Color(130,0,255);
            this.UI_blue.active = false;
            this.UI_red.active = false;
            this.UI_yellow.active = false;
            this.UI_orange.active = false;
            this.UI_green.active = false;
            this.UI_purple.active = true;
        }
        else if(this.red && !this.blue && this.yellow) {
            this.colorShow.color = cc.Color.ORANGE;
            this.UI_blue.active = false;
            this.UI_red.active = false;
            this.UI_yellow.active = false;
            this.UI_orange.active = true;
            this.UI_green.active = false;
            this.UI_purple.active = false;
        }
        else if(!this.red && this.blue && this.yellow) {
            this.colorShow.color = cc.Color.GREEN;
            this.UI_blue.active = false;
            this.UI_red.active = false;
            this.UI_yellow.active = false;
            this.UI_orange.active = false;
            this.UI_green.active = true;
            this.UI_purple.active = false;
        }
        else {
            this.colorShow.color = cc.Color.BLACK;
            this.UI_blue.active = false;
            this.UI_red.active = false;
            this.UI_yellow.active = false;
            this.UI_orange.active = false;
            this.UI_green.active = false;
            this.UI_purple.active = false;
        }
    },

    //attack
    attack()
    {
        if(this.canMove && !this.isDead) {

        if(this.red && this.yellow)
        {
            this.isAttacking = true;
            this.orangeAttack();
            this.setAni('orange');
            this.orangeSound = cc.audioEngine.play(this.audio[1], false, 1);
            this.red = false;
            this.yellow = false;
        }
        else if(this.blue && this.yellow)
        {
            this.isAttacking = true;
            this.greenAttack();
            this.setAni('green');
            this.greenSound = cc.audioEngine.play(this.audio[3], false, 1);
            this.blue = false;
            this.yellow = false;
        }
        else if(this.blue && this.red)
        {
            this.isAttacking = true;
            this.purpleAttack();
            this.setAni('purple');
            this.purpleSound = cc.audioEngine.play(this.audio[0], false, 1);
            this.blue = false;
            this.red = false;
        }
        else if(this.red)
        {
            this.isAttacking = true;
            this.setAni('fire');
            this.redSound = cc.audioEngine.play(this.audio[4], false, 1);
            this.red = false;
        }
        else if(this.yellow)
        {
            this.isAttacking = true;
            this.dash();
            this.dashSound = cc.audioEngine.play(this.audio[2], false, 1);
            this.setAni('idle');
            this.yellow = false;
            
        }
        else if(this.blue)
        {
            this.isAttacking = true;
            this.setAni('ice');
            this.blue = false;
        }
    
        }
        //cc.log(this.anima)
    },
    //into "Invincible";
    /*playerState_Invincible(){
        this.node.group = "Invincible";
    },
    */
    //move
    move()
    {   
        this.node.angle = 0;
        let scaleX = Math.abs(this.node.scaleX);
        this.lv = this.rb.linearVelocity;

        if(Input[cc.macro.KEY.a] || Input[cc.macro.KEY.left])
        {
            this.node.scaleX = -scaleX;
            this.sp.x = -1;
            if(this.isOnGround && !this.isAttacking && !this.greening)
            {
                this.setAni("move");
            }
                
        }
        else if(Input[cc.macro.KEY.d] || Input[cc.macro.KEY.right])
        {
            this.node.scaleX = scaleX;
            this.sp.x = 1;
            if(this.isOnGround && !this.isAttacking && !this.greening)
            {
                this.setAni("move");
            }
                
        }
        else
        {
            this.sp.x = 0;
            if(!this.isAttacking && !this.greening)
                this.setAni("idle");
        }

        if(Input[cc.macro.KEY.w] || Input[cc.macro.KEY.up])
        {
            if(this.canJump && this.jumpCount!=0)
            {
                this.jumpForce = (152000000-200000*this.rb.linearVelocity.y)/(830);
                //cc.log(this.jumpForce);
                if(this.jumpCount==2) this.rb.applyForceToCenter( cc.v2(0,this.jumpForce) , true );
                else if(this.jumpCount==1) 
                {
                    this.rb.applyForceToCenter( cc.v2(0,this.jumpForce) , true );
                    //this.ghost();
                }
                this.setAni("jump");
                this.isOnGround = false;
                this.canJump = false;
                this.jumpCount --;
            }     
        }

        if(this.sp.x)
        {
            this.lv.x = this.sp.x * this._speed;
        }
        else
        {
            this.lv.x = 0;
        }
        this.rb.linearVelocity = this.lv;
    },

    /*switchState()
    {
        switch(this.playerState)
        {
            case State.stand:
                {
                    if(this.red)
                    {
                        this.playerState = State.attack;                        
                    }
                    else if(this.yellow)
                    {  
                        this.playerState = State.attack;  
                    }
                    else if(this.blue)
                    {  
                        this.playerState = State.attack;  
                    }
                    break;
                }
        }
    },*/

    greenAttack()
    {
        this.greening = true;
        this.jumpForce = (172000000-200000*this.rb.linearVelocity.y)/(830);
        this.colorCoolDown(3);
        this.colorCoolDown(2);
        this.rb.applyForceToCenter( cc.v2(0,this.jumpForce) , true );
        this.isAttacking = false;
        this.scheduleOnce(function(){this.greening = false},0.67);
    },

    purpleAttack()
    {
        this.colorCoolDown(1);
        this.colorCoolDown(2);
        if(Variables.purpleAmount == 0) {
            this.scheduleOnce(function(){
                Variables.purpleAmount = 2;
                this.effectNode = cc.find("Canvas/playerEffect")
                var purpleGhost = cc.instantiate(this.purpleEffect);
                purpleGhost.x = this.node.x + 100;
                purpleGhost.y = this.node.y;
                this.effectNode.addChild(purpleGhost);
                var purpleGhost = cc.instantiate(this.purpleEffect);
                purpleGhost.x = this.node.x + -100;
                purpleGhost.y = this.node.y;
                this.effectNode.addChild(purpleGhost);
                },0.9);            
        }

    },

    orangeAttack()
    {
        this.colorCoolDown(1);
        this.colorCoolDown(3);
        this.setAni('orange');
        let tempLen = 9999999999;
        let attackedEnemy = null;
        this.OrangeInteractItem = cc.find("Canvas/OrangeInteractItem");
        for(let i = 0 ; i < this.OrangeInteractItem.childrenCount ; i++)//find the nearest enemy
        {
            let tempX = this.node.x - this.OrangeInteractItem.children[i].x;
            let tempY = this.node.y - this.OrangeInteractItem.children[i].y;
            let tmepv = cc.v2(tempX, tempY);
            cc.log(tmepv.mag())
            if(tmepv.mag() < tempLen)
            {
                tempLen = tmepv.mag();
                attackedEnemy = this.OrangeInteractItem.children[i];
            }
        }
        if(Math.abs(attackedEnemy.x - this.node.x) >= 800 || Math.abs(attackedEnemy.y - this.node.y) >= 270)
            return;
        if(attackedEnemy != null) {
            this.shakeEffect(0.2);
            let tempNode = cc.instantiate(this.orangeEffect);
            attackedEnemy.addChild(tempNode);
            if(attackedEnemy.name == 'barrier' || attackedEnemy.name == 'wizard_effect_4' )
            {
                this.scheduleOnce(function(){attackedEnemy.destroy();},0.5);
            }
        }
    },
    fire()
    {
        //this.redMagicPoint--;
        this.colorCoolDown(1);
        this.newNode = cc.instantiate(this.fireBall);
        /*if(this.node.scaleX < 0)
        {
            this.newNode.getComponent("fireBallControl").speed = -800;
            cc.log(this.newNode.getComponent("fireBallControl").speed)
        }*/
            
        this.node.addChild(this.newNode);
    },

    snow()
    {
        this.colorCoolDown(2);
        this.canvasNode = cc.find("Canvas/playerEffect");
        var snowBall = cc.instantiate(this.snowBallPerfab);
        snowBall.x = this.node.x;
        snowBall.y = this.node.y;
        this.canvasNode.addChild(snowBall);
        var snowRb = snowBall.getComponent(cc.RigidBody);
        if(this.node.scaleX < 0)
        {
            snowRb.applyForceToCenter( cc.v2(-40000,12000));
        }
        else if(this.node.scaleX > 0)
        {
            snowRb.applyForceToCenter( cc.v2(40000,12000));
        }

    },

    setHP(){
        this.HP1 = cc.find("Canvas/bar_UI/UI_hp_bar/UI_hp1");
        this.HP2 = cc.find("Canvas/bar_UI/UI_hp_bar/UI_hp2");
        this.HP3 = cc.find("Canvas/bar_UI/UI_hp_bar/UI_hp3");
        if(this.playerHP == 3) {
            this.HP1.active = true;
            this.HP2.active = true;
            this.HP3.active = true;
        }
        else if(this.playerHP == 2)
        {
            cc.tween(this.HP3)
            .blink(0.5, 3)
            .call(() => {
                this.HP3.active = false;
            }) 
            .start();
        }
        else if(this.playerHP == 1)
        {
            cc.tween(this.HP2)
            .blink(0.5, 3)
            .call(() => {
                this.HP2.active = false;
            }) 
            .start();
        }
        else if(this.playerHP == 0)
        {
            cc.tween(this.HP1)
            .blink(0.5, 3)
            .call(() => {
                this.HP1.active = false;
            }) 
            .start();
        }
    },

    setMP(){
        this.colorBar.removeAllChildren();
        for(var i=0; i<this.redMagicPoint; i++)
        {
            var red = cc.instantiate(this.redBar);
            red.x = -22 + i*5;
            red.y = 7;
            this.colorBar.addChild(red);
        }
        for(var i=0; i<this.blueMagicPoint; i++)
        {
            var blue = cc.instantiate(this.blueBar);
            blue.x = -22 + i*5;
            blue.y = 0;
            this.colorBar.addChild(blue);
        }
        for(var i=0; i<this.yellowMagicPoint; i++)
        {
            var yellow = cc.instantiate(this.yellowBar);
            yellow.x = -22 + i*5;
            yellow.y = -7;
            this.colorBar.addChild(yellow);
        }
    },

    localConvertWorldPoint(node) {
        if (node) {
            return node.convertToWorldSpace(cc.v2(0, 0));
        }
        return null;
    },

    shakeEffect(duration) {
        this.camera = cc.find("Canvas/Main Camera")
        this.camera.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.moveBy(0.02, cc.v2(5, 7)),
                    cc.moveBy(0.02, cc.v2(-6, 7)),
                    cc.moveBy(0.02, cc.v2(-13, 3)),
                    cc.moveBy(0.02, cc.v2(3, -6)),
                    cc.moveBy(0.02, cc.v2(-5, 5)),
                    cc.moveBy(0.02, cc.v2(2, -8)),
                    cc.moveBy(0.02, cc.v2(-8, -10)),
                    cc.moveBy(0.02, cc.v2(3, 10)),
                    cc.moveBy(0.02, cc.v2(0, 0))
                )
            )
        );

        setTimeout(() => {
            this.camera.stopAllActions();
            //this.camera.setPosition(0,0);
        }, duration*1000);
    },

    update (dt) 
    {    
        cc.log(this.canMove,this.isDead)
        this.playerHP = Variables.playerHP;
        if(cc.director.getScene().name == "menuScence") this.canMove = Variables.playerCanMove;
        //cc.log(this.isOnGround);
        //cc.log("isDashing " + this.isDashing);
        if(this.canMove){
            this.color_detect();
            if(/*this.playerState == State.stand && */!this.isDashing && !this.isAttacking)
            {
                this.move();
                this.isDead = false;
            }
        } else {
            if(this.isOnGround && !this.respawning && this.isDead && this.playerHP > 0) {
                this.respawning = true;
                cc.tween(this.node)
                .call(() => {
                    this.isDead = false;
                    this.isAttacking = false;
                    if(this.yellow) {
                        this.nodeSetAni(this.new_yellowBar,'yellowBar_refill');
                        this.scheduleOnce(function(){this.nodeSetAni(this.new_yellowButton,'yellowButton_up');},2);
                    }
                    if(this.red) {
                        this.nodeSetAni(this.new_redBar,'redBar_refill');
                        this.scheduleOnce(function(){this.nodeSetAni(this.new_redButton,'redButton_up');},2);
                    }
                    if(this.blue) {
                        this.nodeSetAni(this.new_blueBar,'blueBar_refill');
                        this.scheduleOnce(function(){this.nodeSetAni(this.new_blueButton,'blueButton_up');},2);
                    }
                    this.yellow = false;
                    this.red = false;
                    this.blue = false;
                }) 
                .delay(2)
                .call(() => {
                    this.node.group = "Invincible";
                    this.setAni('idle');
                    this.canMove = true;
                    Variables.playerCanMove = true;
                    this.scheduleOnce(function(){this.node.group = "Player";},3);
                }) 
                .blink(3, 10)
                .call(() => {
                    this.respawning = false;
                }) 
                .start();
            }
            else if(this.playerHP <= 0 && !this.entering) {
                //this.scheduleOnce(function(){cc.director.loadScene("menuScence");;},2);
                this.entering = true;
                this.scheduleOnce(function() {
                this.canvas = cc.find("Canvas");
                this.camera = cc.find("Canvas/Main Camera");
                var enterName = cc.instantiate(this.enterMyName);
                enterName.getChildByName("point").getComponent(cc.Label).string = Variables.score;
                enterName.x = this.camera.x;
                enterName.y = this.camera.y;
                this.canvas.addChild(enterName);},2);
            }
        }
        var lowJumpMultiplier = 2; //控制輕跳時的重力
        var fallMultiplier = 2.5;    //控制下墜時的重力
        var limitMultiplier = 1.6; //增重力避免漂浮感 origin = 1.5
        this.lv = this.rb.linearVelocity;
        //cc.log(this.lv.y);
        if(!this.isDashing) {
            if(this.lv.y < 0) { //當角色下降時
                this.lv.y += cc.Vec2.UP.y * cc.director.getPhysicsManager().gravity.y * (fallMultiplier - 1) * dt;
            } 
            /*else if(this.lv.y > 0 && !Input[cc.macro.KEY.w]) { //當角色輕跳時
                this.lv.y += cc.Vec2.UP.y * cc.director.getPhysicsManager().gravity.y * (lowJumpMultiplier - 1) * dt;
            }*/
            else if(this.lv.y > 0) { //當角色上升時
                this.lv.y += cc.Vec2.UP.y * cc.director.getPhysicsManager().gravity.y * (limitMultiplier - 1) * dt;
            }
            if(this.onWall) this.wallSlide();
            this.rb.linearVelocity = this.lv; 
        }
    },
});
