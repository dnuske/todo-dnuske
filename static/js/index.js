//
//
//   So this is it, where the magic happens
//
//


var local_config = {
    user: {/*user dict*/},
};

var SITE_MODE = {};
SITE_MODE.LOADING = 'mode-loading';
SITE_MODE.INITIAL = 'mode-initial';
SITE_MODE.LOGED_IN = 'mode-loggedin';
SITE_MODE.EDIT = 'mode-edit';

var ELEMENT_TYPE = {};
ELEMENT_TYPE.MOVE = '--move';
ELEMENT_TYPE.REPLICATE = '--replicate';

var STORE_WAY = {};
STORE_WAY.IN = 'IN';
STORE_WAY.OUT = 'OUT';

var PLACE = {};
PLACE.HEAD = 'head-bar';
PLACE.BODY = 'body-bar';
PLACE.FOOT = 'foot-bar';

var RELEVANCE = {};
RELEVANCE.DO_OR_DIE = 'DO_OR_DIE';
RELEVANCE.IMPORTANT  = 'IMPORTANT';
RELEVANCE.BETTER_DONE = 'BETTER_DONE';
RELEVANCE.MEH = 'MEH';

var RELEVANCE_PRIORITY = {}
RELEVANCE_PRIORITY.DO_OR_DIE = 0;
RELEVANCE_PRIORITY.IMPORTANT  = 1;
RELEVANCE_PRIORITY.BETTER_DONE = 2;
RELEVANCE_PRIORITY.MEH = 3;

var SORT_OPTIONS = {};
SORT_OPTIONS['DUE'] = 'DUE';
SORT_OPTIONS['PRIORITY'] = 'PRIORITY';

var current_status = SITE_MODE.LOADGIN;


var APIClient = new function() {
    var self = this;
    //state
    self.ajaxDefaults = {
            url: "/api/",
            type: "GET",
            dataType: "json",
            contentType: "application/json",
            accepts: "application/json",
            //data: JSON.stringify(data),
            //success: undefined,
            //error: self.errorCallback
        };

    self.duration = 0;
    self.token = undefined;
    self.username = undefined;


    // API calls
    self.createUser = function(user, pass, callback, callbackError){
        data = {username: user, password: pass}
        var ajaxSettings = _(self.ajaxDefaults).clone();
        ajaxSettings.url += 'users';
        console.log('sending data ->', data);
        ajaxSettings.data = JSON.stringify(data);
        ajaxSettings.type = "POST";
        ajaxSettings.success = function(data){
            //console.log('data', data);
            if (callback!==undefined){
                callback(data);
            }
        }
        ajaxSettings.error = function(data){
            self.errorCallback();
            if (callbackError!==undefined){
                callbackError(data);
            }
        };
        //console.log("ajaxSettings", ajaxSettings);
        $.ajax(ajaxSettings);
    }
    self.login = function(user, pass, callback, callbackError){
        var ajaxSettings = _(self.ajaxDefaults).clone();
        ajaxSettings.url += 'token';
        ajaxSettings.beforeSend = function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(user + ":" + pass));
        };
        ajaxSettings.success = function(data){
            //console.log('data', data);
            self.duration = data.duration;
            self.token = data.token;
            self.username = user;
            if (callback!==undefined){
                callback(data);
            }
        }
        ajaxSettings.error = function(data){
            self.errorCallback();
            if (callbackError!==undefined){
                callbackError(data);
            }
        };
        //console.log("ajaxSettings", ajaxSettings);
        $.ajax(ajaxSettings);
    }
    self.listTasks = function(callback){
        var ajaxSettings = _(self.ajaxDefaults).clone();
        ajaxSettings.url += 'tasks';
        ajaxSettings.beforeSend = function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(self.token + ":x"));
        };
        ajaxSettings.success = function(data){
            utils.logApi(['listTasks', data]);
            if (callback!==undefined){
                callback(data);
            }
        }
        ajaxSettings.error = self.errorCallback;
        //console.log("ajaxSettings", ajaxSettings);
        $.ajax(ajaxSettings);
    }
    self.getRandomAnonymousTask = function(callback){
        var ajaxSettings = _(self.ajaxDefaults).clone();
        ajaxSettings.url += 'app/randomAnonymousTask';
        ajaxSettings.success = function(data){
            utils.logApi(['getRandomAnonymousTask', data]);
            if (callback!==undefined){
                callback(data);
            }
        }
        ajaxSettings.error = self.errorCallback;
        $.ajax(ajaxSettings);
    }


    self.createTask = function(text, due, relevance, callback, callbackError){
        //curl -i -X POST -H "Content-Type: application/json" -d '{"text":"do something","due":"8", "relevance":"DO_OR_DIE"}' -u user:pass http://127.0.0.1:5000/api/tasks
        data = {text: text, due: due, relevance:relevance}
        var ajaxSettings = _(self.ajaxDefaults).clone();
        ajaxSettings.url += 'tasks';
        //console.log('sending data ->', data);
        ajaxSettings.data = JSON.stringify(data);
        ajaxSettings.type = "POST";
        ajaxSettings.beforeSend = function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(self.token + ":x"));
        };
        ajaxSettings.success = function(data){
            //console.log('data', data);
            if (callback!==undefined){
                callback(data);
            }
        }
        ajaxSettings.error = function(data){
            self.errorCallback();
            if (callbackError!==undefined){
                callbackError(data);
            }
        };
        //console.log("ajaxSettings", ajaxSettings);
        $.ajax(ajaxSettings);
    }
    self.updateTask = function(id,data,callback){
        //curl -i -X PUT -H "Content-Type: application/json" d '{"due":4}' -u test:test http://127.0.0.1:5000/api/tasks/3
        var ajaxSettings = _(self.ajaxDefaults).clone();
        ajaxSettings.url += 'tasks/'+id;
        //console.log('sending data ->', data);
        ajaxSettings.data = JSON.stringify(data);
        ajaxSettings.type = "PUT";
        ajaxSettings.beforeSend = function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(self.token + ":x"));
        };
        ajaxSettings.success = function(data){
            //console.log('data', data);
            /*self.duration = data.duration;
            self.token = data.token;
            if (callback!==undefined){
                callback(data);
            }*/
        }
        ajaxSettings.error = self.errorCallback;
        //console.log("ajaxSettings", ajaxSettings);
        $.ajax(ajaxSettings);
    }
    // APIClient helper functions
    self.errorCallback = function(data){
        console.log('ERROR ', data);
    }
    self.getCredentials = function(){
        console.log('getCredentials ', data);
    }
    self._storeCredentials = function(data){
        console.log('_storeCredentials ', data);
    }
}();

var AA = 'test';

/*APIClient.getTasks(function(data){
    console.log(data.id);
})*/


//
// Controllers: are the managers of DOM objects, they handle data 
// and turn it in something the user can appreciate.
//

function TasksController() {
    var self = this;
    // tasks as in {id: task}
    self.tasks = {};

    self.beginAdd = function() {
        alert("Add");
    }
    self.beginEdit = function(task) {
        alert("Edit: " + task.title());
    }
    self.remove = function(task) {
        alert("Remove: " + task.title());
    }
    self.markInProgress = function(task) {
        task.done(false);
    }
    self.markDone = function(task) {
        task.done(true);
    }
}


var SiteController = new function(){
    var self = this;
    self._smartActive = [];

    self._placeSelector = function(place){
        return "." + place;
    }
    self._modeSelector = function(place){
        return "." + place;
    }
    self._buildSelector = function(place, selector, mode, type){
        // build selector in the form:
        // .place > .selector.mode > .mode--type
        // ex.: .head-bar > .header.mode-loading > .mode-loading--move
        return self._placeSelector(place) + ' > ' + selector + self._modeSelector(mode) + ' > ' + self._modeSelector(mode) + type
    }

    //internal methods
    self._store = function(place, selector, mode, type, verbose){
        /*
        store moves DOM elements in or out the .storage hidden DOM element 
        */
        var select = self._buildSelector(place, selector, mode, type);
        
        var elem = $(select);
        if (verbose==true) {console.log("$('" + select + "');")}
        if (verbose==true) {console.log(elem[0])}
        var storage = $(self._placeSelector(place) + ' > ' + '.storage');
        if (verbose==true) {console.log("$('" + self._placeSelector(place) + ' > ' + '.storage' + "');")}
        if (verbose==true) {console.log(storage[0])}

        if(elem.length == 0){
            console.log("WARNING: empty selection", select);
        }
        if(type == ELEMENT_TYPE.MOVE){

            elem.detach();
            storage.append(elem);

        }
    }
    //internal methods
    self._unstore = function(place, selector, mode, type, verbose){
        /*
        grabs from .storage what is needed to display
        */
        //var selector = self._buildSelector(place, selector, mode, type);
        //console.log('unstoring ', selector);

        
        var storage = $([self._placeSelector(place), '.storage'].join(' > '));
        utils.logVerbose(verbose, [storage.selector, storage]);
        if(storage.length == 0){
            console.log("WARNING: empty selection", storage.selector);
        }
        var elemToDeploy = $(self._modeSelector(mode) + type ,storage);
        utils.logVerbose(verbose, [elemToDeploy.selector, elemToDeploy]);
        if(elemToDeploy.length == 0){
            console.log("WARNING: empty selection", elemToDeploy.selector);
        }
        var placeToDeploy = $([self._placeSelector(place), selector].join(' > '));
        utils.logVerbose(verbose, [placeToDeploy.selector, placeToDeploy]);
        if(placeToDeploy.length == 0){
            console.log("WARNING: empty selection", placeToDeploy.selector);
        }

        if(type == ELEMENT_TYPE.MOVE){

            elemToDeploy.detach();
            placeToDeploy.append(elemToDeploy);

        }
    }

    self._register = function(place, selector, mode){
        // adds mode from DOM Elements
        $([self._placeSelector(place), selector].join(' > ')).addClass(mode);
    }
    self._removeAllSmartActive = function(){
        _.map(self._smartActive, function(sa){sa.deactivate();});
        self._smartActive = [];
    }
    self._addSmartActive = function(smartActive){
        // a smartActive object is just an object that has an activate and deactivate method
        // those methods are called from controller, to gain authority to all is happenning
        smartActive.activate();
        self._smartActive.push(smartActive);
    }
    self._unregister = function(place, selector, mode){
        // removes mode from DOM Elements
        $( [ self._placeSelector(place), selector].join(' > ') ).removeClass(mode);
    }

    self.changeMode = function(newmode){
        //restructure the ste according the new mode
    }

    self.activateMode = function(mode){
        console.log(" >>> ACTIVATING MODE:",mode)

        //move DOM elements
        self._unstore(PLACE.HEAD ,'.header', mode, ELEMENT_TYPE.MOVE);
        self._unstore(PLACE.BODY ,'.canvas', mode, ELEMENT_TYPE.MOVE);
        //add new mode-{mode}
        self._register(PLACE.HEAD ,'.header', mode);
        self._register(PLACE.BODY ,'.canvas', mode);

        if (mode == SITE_MODE.LOADING){
            //#####################################################
            //#####################################################
            //#################### LOADING MODE ###################
            //#####################################################
            //#####################################################


        }
        else if (mode == SITE_MODE.INITIAL){
            //#####################################################
            //#####################################################
            //#################### INITIAL MODE ###################
            //#####################################################
            //#####################################################

            //enable mode functionallity
            // selector functionallity

            //animate ticker


            var homeTickerAnimation = function(){
                var self = this;

                self.tl = new TimelineMax();
                self.tl.pause();

                self.updateRandomTask = function(){
                    //console.log('---called---');
                    //update card content
                    APIClient.getRandomAnonymousTask(self.animateTaskCardPresentation);
                }

                //come from right
                self.tl.add( TweenLite.fromTo('.body-bar .canvas .task-card--presentation', 2, {left:"2000px"}, {left:"0px",ease:Power2.easeOut}) );
                //moves to left
                self.tl.add( TweenLite.to('.body-bar .canvas .task-card--presentation', 2, {left:"-2000px",ease:Power2.easeIn,delay:2.5, onComplete: self.updateRandomTask}) );

                self.animateTaskCardPresentation = function(task){
                    $('.body-bar .canvas .task-card--presentation .due div').text(task.task.due);
                    $('.body-bar .canvas .task-card--presentation .text').text(task.task.text);
                    $('.body-bar .canvas .task-card--presentation .relevance').addClass(task.task.relevance);

                    self.tl.seek(0);
                    self.tl.play();

                }
                
                self.activate = function(){
                    self.updateRandomTask();
                }
                self.deactivate = function(){
                    self.tl.pause();
                    self.tl.seek(0);
                }
            }
            var homeTickerAnimationInstance = new homeTickerAnimation()
            self._addSmartActive(homeTickerAnimationInstance);

            var createUserAndLogin = function(){
                var self = this;


                self.animationTicker = $('.body-bar .canvas .task-card--presentation');
                self.loginForm = $('.ticker > .login-form');
                self.registerForm = $('.ticker > .register-form');
                self.registerFormUser = $('.ticker > .register-form [name="user"]');
                self.registerFormPass1 = $('.ticker > .register-form [name="pass1"]');
                self.registerFormPass2 = $('.ticker > .register-form [name="pass2"]');
                self.registerFormSubmit = $('.ticker > .register-form [type="button"]');

                //initiate hiding the regiter form, it should be vissible only when the user click "join"
                self.registerForm.hide();

                self.registerButtonClicked = function(){
                    homeTickerAnimationInstance.deactivate();
                    self.loginForm.hide();

                    self.deactivateSubmit();

                    self.animationTicker.detach();
                    self.loginForm.hide();
                    self.registerForm.show();

                    var userValidation = function(){ 
                        if ( self.registerFormUser.val().length > 0){
                            self.activateSubmit();
                        }else{
                            self.deactivateSubmit();
                        }
                    }
                    var pass2Validation = function(){ 
                        if ( self.registerFormPass1.val() !=  self.registerFormPass2.val()){
                            self.registerFormPass2.css({border:"solid 2px red"} )
                            self.deactivateSubmit();
                        }else{
                            self.registerFormPass2.css({border:"solid 2px green"} )
                            self.activateSubmit();
                        }
                    }

                    self.registerFormPass2.on('keyup', pass2Validation);
                    self.registerFormPass2.on('focus', pass2Validation);
                    self.registerFormPass1.on('keyup', pass2Validation);
                    self.registerFormPass1.on('focus', pass2Validation);
                    self.registerFormUser.on('keyup', userValidation);
                    self.registerFormUser.on('focus', userValidation);
                }

                self.activateSubmit = function(){
                    if( self.registerFormUser.val().length > 0 && self.registerFormPass1.val().length > 0 ){
                        self.registerFormSubmit.removeAttr('disabled');
                    }
                }
                self.deactivateSubmit = function(){
                    self.registerFormSubmit.attr('disabled',true);
                }

                self.subscribe = function(){
                    console.log('let me in!');


                    var callback = function(){
                        APIClient.login(self.registerFormUser.val(), self.registerFormPass1.val(), function(){
                            SiteController.deactivateMode(SITE_MODE.INITIAL);
                            SiteController.activateMode(SITE_MODE.LOGED_IN);
                        });
                    }
                    var callbackError = function(){
                        var prevColor = self.registerFormUser.css('color');
                        var prevVal = self.registerFormUser.val();
                        self.registerFormUser.val('try another username');
                        self.registerFormUser.css({color:'red'});
                        setTimeout(function(){
                            self.registerFormUser.val(prevVal);
                            self.registerFormUser.css({color:prevColor});                            
                        }, 2000);
                    }

                    APIClient.createUser(self.registerFormUser.val(), self.registerFormPass1.val(), callback, callbackError)

                    //registerFormUser.val()
                    //registerFormPass1
                }

                self.activate = function(){
                    //bind buttons
                    $('.register-box').on('click', self.registerButtonClicked);
                    self.registerFormSubmit.on('click', self.subscribe);


                }
                self.deactivate = function(){
                    $('.register-box').off('click');
                    self.registerFormSubmit.off('click');
                }
            }            
            self._addSmartActive(new createUserAndLogin());

            var LoginForm = function(){
                var self = this;

                self.animationTicker = $('.body-bar .canvas .task-card--presentation');
                self.registerForm = $('.ticker > .register-form');
                self.loginForm = $('.ticker > .login-form');
                self.loginFormUser = $('.ticker > .login-form [name="login-user"]');
                self.loginFormPass = $('.ticker > .login-form [name="login-pass"]');
                self.loginFormSubmit = $('.ticker > .login-form [type="button"]');

                //initiate hiding the regiter form, it should be vissible only when the user click "join"
                self.loginForm.hide();

                self.loginButtonClicked = function(){
                    homeTickerAnimationInstance.deactivate();
                    self.registerForm.hide();

                    self.deactivateSubmit();

                    self.animationTicker.detach();
                    self.loginForm.show();

                    var formValidation = function(){ 
                        if( self.loginFormUser.val().length > 0 && self.loginFormPass.val().length > 0 ){
                            self.activateSubmit();
                        }else{
                            self.deactivateSubmit();
                        }
                    }

                    self.loginFormPass.on('keyup', formValidation);
                    self.loginFormUser.on('keyup', formValidation);
                }

                self.activateSubmit = function(){
                    self.loginFormSubmit.removeAttr('disabled');
                }
                self.deactivateSubmit = function(){
                    self.loginFormSubmit.attr('disabled',true);
                }

                self.doLogin = function(){
                    console.log('get me in');

                    var callback = function(){
                        SiteController.deactivateMode(SITE_MODE.INITIAL);
                        SiteController.activateMode(SITE_MODE.LOGED_IN);
                    }

                    var callbackError = function(data){
                        var prevColor = self.loginFormUser.css('color');
                        var prevVal = self.loginFormUser.val();
                        if(data.status == 403){
                            self.loginFormUser.val('try again!');
                        }else{
                            self.loginFormUser.val('an error has ocurred :/ ');
                        }
                        self.loginFormUser.css({color:'red'});
                        self.deactivateSubmit();
                        setTimeout(function(){
                            self.loginFormUser.val(prevVal);
                            self.loginFormUser.css({color:prevColor});                            
                        }, 2000);
                    }

                    APIClient.login(self.loginFormUser.val(), self.loginFormPass.val(), callback, callbackError);

                }

                self.activate = function(){
                    //bind buttons
                    $('.login-box').on('click', self.loginButtonClicked);
                    self.loginFormSubmit.on('click', self.doLogin);


                }
                self.deactivate = function(){
                    $('.login-box').off('click');
                    self.loginFormSubmit.off('click');
                }
            }
            self._addSmartActive(new LoginForm());

            //enable mode events functionallity
            // selector functionallity
        }
        else if (mode == SITE_MODE.LOGED_IN){
            //#####################################################
            //#####################################################
            //################### LOGGED IN MODE ##################
            //#####################################################
            //#####################################################

            var Cards = function (){
                var self = this;

                self.tasks = [];

                self.DOMElements = {};
                self.DOMElements['newcard-box'] = $('.head-bar > .header > .newcard-box');
                self.DOMElements['sort-options'] = $('.body-bar > .canvas  [name="sort-options"]');
                self.DOMElements['task-cards'] = $('.body-bar > .canvas > .task-card');

                self.setUserData = function(){
                    var DOMElements = {};
                    DOMElements['userPanel'] = $('.loggedin-box');
                    DOMElements['userPanel'].text(APIClient.username);
                }

                self.loadCards = function(){
                    //gather user task from database
                    APIClient.listTasks(function(data){
                        self.tasks = data['tasks'];
                        self.setupStatusBar(data['tasks']);
                        self.displayCards();
                    })

                }

                self.removeCards = function(){
                    DOMController.store(PLACE.BODY ,'.task-card', mode, ELEMENT_TYPE.REPLICATE);
                }

                self.displayCards = function(){
                    //gather user task from database
                    _.map(self.sortCards(self.tasks), self.setupCard);
                }

                self.setupStatusBar = function(tasks){
                    taskByRelevanceCount = _.countBy(tasks, function(task) {
                        return task.relevance;
                    });

                    _.map(taskByRelevanceCount, function(count, relev){$(['.status-box', '.status-area', '.'+relev].join(' > ') ).text(count);})
                }

                self.sortCards = function(tasks){

                    if (self.DOMElements['sort-options'].val() == SORT_OPTIONS.DUE){
                        return tasks.sort(function(a,b){
                            if (a.due < b.due) return 1;
                            if (b.due < a.due) return -1;
                            return 0;
                        });
                    }
                    if (self.DOMElements['sort-options'].val() == SORT_OPTIONS.PRIORITY){
                        return self.tasks.sort(function(a,b){
                            if (RELEVANCE_PRIORITY[a.relevance] < RELEVANCE_PRIORITY[b.relevance]) return 1;
                            if (RELEVANCE_PRIORITY[b.relevance] < RELEVANCE_PRIORITY[a.relevance]) return -1;
                            return 0;
                        });
                    }else{
                        return tasks
                    }
                }

                self.sortCardsClicked = function(tasks){
                    $('.body-bar > .canvas > .task-card').remove();
                    self.displayCards();
                }

                self.setupCard = function(task){
                    //create card Control for each task

                    // unstore .task-card--replicate
                    DOMController.unstore(PLACE.BODY ,'.task-card', mode, ELEMENT_TYPE.REPLICATE, function(elementToDeploy){
                        var DOMElements = {};
                        DOMElements['text'] = $('.text', elementToDeploy);
                        DOMElements['due'] = $('.due > div', elementToDeploy);
                        DOMElements['relevance'] = $('.relevance', elementToDeploy);

                        DOMElements['text'].text(task.text);
                        DOMElements['due'].text(task.due);
                        DOMElements['relevance'].addClass(task.relevance);

                        if (task.done){
                            DOMElements['text'].addClass('done');
                        }

                    });

                }

                self.addTaskClicked = function(){
                    SiteController.deactivateMode(SITE_MODE.LOGED_IN);
                    SiteController.activateMode(SITE_MODE.EDIT);
                }

                //smart active methods
                self.activate = function (){
                    self.loadCards();
                    self.setUserData();

                    //bind add task button
                    self.DOMElements['newcard-box'].on('click', self.addTaskClicked);
                    self.DOMElements['sort-options'].on('change', self.sortCardsClicked);

                }
                self.deactivate = function (){
                    //unbind add task button
                    self.DOMElements['sort-options'].off('change');
                    self.DOMElements['newcard-box'].off('click');

                }

            }

            self._addSmartActive(new Cards());

        }
        else if (mode == SITE_MODE.EDIT){
            //#####################################################
            //#####################################################
            //##################### EDIT MODE #####################
            //#####################################################
            //#####################################################

            console.log('--mode edit--');

            var setUpEditCard = function(){
                var self = this;
                var DOMElements = {};

                DOMElements['due-up'] = $('.task-card-edit > .main [name="due-up"]');
                DOMElements['due-days'] = $('.task-card-edit > .main [name="due-days"]');
                DOMElements['due-down'] = $('.task-card-edit > .main [name="due-down"]');
                DOMElements['create-task-text'] = $('.task-card-edit > .main [name="create-task-text"]');
                DOMElements['save'] = $('.task-card-edit [name="save"]');
                DOMElements['cancel'] = $('.task-card-edit [name="cancel"]');
                DOMElements['relevanceMonitor'] = $('.task-card-edit > .main .relevance');
                DOMElements['relevance'] = $('.task-card-edit [name="relevance"]');

                DOMElements['relevanceMonitor'].changeRelevance = function(rel){
                    for(rel2 in RELEVANCE){
                        DOMElements['relevanceMonitor'].removeClass(rel2);
                    }
                    DOMElements['relevanceMonitor'].addClass(rel);
                }

                self.resetValues = function(){
                    parseInt(DOMElements['due-days'].text(1));
                    DOMElements['create-task-text'].val('');
                    DOMElements['relevanceMonitor'].changeRelevance(RELEVANCE.DO_OR_DIE)
                }

                self.dueUpClicked = function(){
                    curNum = parseInt(DOMElements['due-days'].text())
                    DOMElements['due-days'].text(((curNum<100) ? curNum+1 : curNum) );
                };
                self.dueDownClicked = function(){
                    curNum = parseInt(DOMElements['due-days'].text())
                    DOMElements['due-days'].text(((curNum>1) ? curNum-1 : curNum) );
                };
                self.relevanceSelected = function(e){
                    for(rel in RELEVANCE){
                        if ($(e.currentTarget).hasClass(rel)){
                            DOMElements['relevanceMonitor'].changeRelevance(rel);
                        }
                    }
                }
                self.saveClicked = function(){
                    var due = parseInt(DOMElements['due-days'].text());
                    var text = DOMElements['create-task-text'].val();
                    var relevance = undefined;
                    for(rel in RELEVANCE){
                        if (DOMElements['relevanceMonitor'].hasClass(rel)){
                            relevance = rel;
                        }
                    }
                    var callback = function(){
                        console.log('----------TASK SAVED---------');
                        self.cancelClicked();
                    }
                    var callbackError = function(){
                        console.log('----------SOMETHING IS NOT GOOD---------');
                    }
                    APIClient.createTask(text, due, relevance, callback, callbackError);

                };
                self.cancelClicked = function(){
                    SiteController.deactivateMode(SITE_MODE.EDIT);
                    SiteController.activateMode(SITE_MODE.LOGED_IN);
                };


                //smart active methods
                self.activate = function (){
                    //bind buttons
                    DOMElements['due-up'].on('click', self.dueUpClicked);
                    DOMElements['due-down'].on('click', self.dueDownClicked);
                    DOMElements['save'].on('click', self.saveClicked);
                    DOMElements['cancel'].on('click', self.cancelClicked);

                    DOMElements['relevance'].on('click', self.relevanceSelected);

                    self.resetValues();
                    DOMElements['create-task-text'].focus();


                }
                self.deactivate = function (){
                    //unbind buttons
                    DOMElements['due-up'].off('click');
                    DOMElements['due-down'].off('click');
                    DOMElements['save'].off('click');
                    DOMElements['cancel'].off('click');

                    DOMElements['relevance'].off('click');
                }

            }

            self._addSmartActive(new setUpEditCard());


        }
    }

    self.deactivateMode = function(mode){
        console.log(" <<< DEACTIVATING MODE:",mode)
        //move overlays
        self._store(PLACE.HEAD ,'.header', mode, ELEMENT_TYPE.MOVE);
        self._store(PLACE.BODY ,'.canvas', mode, ELEMENT_TYPE.MOVE);
        //remove mode registration from Elements
        self._unregister(PLACE.HEAD ,'.header', mode);
        self._unregister(PLACE.BODY ,'.canvas', mode);

        self._removeAllSmartActive();

        if (mode == SITE_MODE.LOADING){}
        else if (mode == SITE_MODE.INITIAL){}
    }

}();


var DOMController = new function(){
    var self = this;

    self._placeSelector = function(place){
        return "." + place;
    }
    self._modeSelector = function(place){
        return "." + place;
    }
    self._buildSelector = function(place, selector, mode, type){
        // build selector in the form:
        // .place > .selector.mode > .mode--type
        // ex.: .head-bar > .header.mode-loading > .mode-loading--move
        return self._placeSelector(place) + ' > ' + selector + self._modeSelector(mode) + ' > ' + self._modeSelector(mode) + type
    }

    //internal methods
    self.unstore = function(place, selector, mode, type, beforeDeploy, verbose){
        /*
        grabs from .storage what is needed to display
        */
        //var selector = self._buildSelector(place, selector, mode, type);
        //console.log('unstoring ', selector);

        
        var storage = $([self._placeSelector(place), '.storage'].join(' > '));
        utils.logVerbose(verbose, [storage.selector, storage]);
        if(storage.length == 0){
            console.log("WARNING: empty selection", storage.selector);
        }
        var elemToDeploy = $(selector + type ,storage);
        utils.logVerbose(verbose, [elemToDeploy.selector, elemToDeploy]);
        if(elemToDeploy.length == 0){
            console.log("WARNING: empty selection", elemToDeploy.selector);
        }
        var placeToDeploy = $([self._placeSelector(place), self._modeSelector(mode)].join(' > '));
        utils.logVerbose(verbose, [placeToDeploy.selector, placeToDeploy]);
        if(placeToDeploy.length == 0){
            console.log("WARNING: empty selection", placeToDeploy.selector);
        }

        if(type == ELEMENT_TYPE.MOVE){

            elemToDeploy.detach();
            placeToDeploy.append(elemToDeploy);

        }
        else if(type == ELEMENT_TYPE.REPLICATE){

            var etd = elemToDeploy.clone();

            if(typeof beforeDeploy != 'undefined'){
                beforeDeploy(etd);
            }

            placeToDeploy.append(etd);

        }

    }
    //internal methods
    self.store = function(place, selector, mode, type, beforeDeploy, verbose){
        /*
        grabs from .storage what is needed to display
        */
        //var selector = self._buildSelector(place, selector, mode, type);
        //console.log('unstoring ', selector);

        var storage = $([self._placeSelector(place), '.storage'].join(' > '));
        utils.logVerbose(verbose, [storage.selector, storage]);
        if(storage.length == 0){
            console.log("WARNING: empty selection", storage.selector);
        }
        var elemToStore = $(selector + type ,storage);
        utils.logVerbose(verbose, [elemToDeploy.selector, elemToDeploy]);
        if(elemToDeploy.length == 0){
            console.log("WARNING: empty selection", elemToDeploy.selector);
        }
        var placeToDeploy = $([self._placeSelector(place), self._modeSelector(mode)].join(' > '));
        utils.logVerbose(verbose, [placeToDeploy.selector, placeToDeploy]);
        if(placeToDeploy.length == 0){
            console.log("WARNING: empty selection", placeToDeploy.selector);
        }

        if(type == ELEMENT_TYPE.MOVE){

            elemToDeploy.detach();
            placeToDeploy.append(elemToDeploy);

        }
        else if(type == ELEMENT_TYPE.REPLICATE){

            var etd = elemToDeploy.clone();

            if(typeof beforeDeploy != 'undefined'){
                beforeDeploy(etd);
            }

            placeToDeploy.append(etd);

        }

    }

    self._register = function(place, selector, mode){
        // adds mode from DOM Elements
        $([self._placeSelector(place), selector].join(' > ')).addClass(mode);
    }


}


var UserController = new function(){
    var self = this;

    self.login = function(user, pass){
        APIClient.login(user, pass)
    }
}


var utils = new function(){
    var self = this;

    self.enableLogApi = true;

    self.sleep = function(milliseconds) {
      var start = new Date().getTime();
      for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
          break;
        }
      }
    }
    self.logVerbose = function(verbose, content) {
      if (verbose == true ){
        console.log(content);
      }
    }
    self.logApi = function(t) {
      if (self.enableLogApi == true ){
        console.log(' API > ', t);
      }
    }
}

SiteController.deactivateMode(SITE_MODE.LOADING);
SiteController.activateMode(SITE_MODE.INITIAL);



// FORCE STATE
// comment all the following lines to get the regular site functionallity

setTimeout(function(){

    SiteController.deactivateMode(SITE_MODE.INITIAL);
    setTimeout(function(){
        APIClient.login('test', 'test');
        setTimeout(function(){
            SiteController.activateMode(SITE_MODE.LOGED_IN);

            //SiteController.deactivateMode(SITE_MODE.LOGED_IN);
            //SiteController.activateMode(SITE_MODE.EDIT);
        },200);
    },500);


},500)




