window.onload = function(){
    initDataBase();
    initLeftContent();
    
    var EventUtil = {
        addHandler: function(element,type,handler){
            if(element.addEventListener){
                element.addEventListener(type,handler,false);            
            }
            else if(element.attachEvent){//IE浏览器
                element.attachEvent("on"+type,handler);
            }
            else{
                element["on"+type] = handler;
            }
        },
        removerHandler: function(element,type,handler){
            if(element.removeEventListener){
                element.removeEventListener(type,handler,false);
            }
            else if(element.detachEvent){
                element.detachEvent("on"+type,handler);
            }
            else{
                element["on"+type] = handler;
            }
        },
        getEvent:function(event){
            return event?event:window.event;
        },
        getTarget:function(event){
            return event.target||event.srcElement; 
        },
        preventDefault:function(event){
            if(event.preventDefault){
                event.preventDefault();
            }else{
                event.returnValue = false;
            }
        },
        stopPropagation:function(event){
            if(event.stopPropagation){
                event.stopPropagation();
            }else{
                event.cancelBubble = true;
            }
        }
    };
    
    EventUtil.addHandler(document.querySelector('.addcate'),"click",clickAddCate);//增加分类的点击事件
    EventUtil.addHandler(document.querySelector('#ok'),"click",cateAdd);//增加分类的弹出窗口确定按钮的点击事件
    EventUtil.addHandler(document.querySelector('#no'),"click",coverHide);//增加分类的弹出窗口取消按钮的点击事件
    EventUtil.addHandler(document.querySelector('#alltask'),"click",clickAllTask);//所有任务的点击事件
    EventUtil.addHandler(document.querySelector('.left-content'),"click",function(event){//分类栏部分事件委托
        event = EventUtil.getEvent(event);
        var target = EventUtil.getTarget(event);
        console.log(target);
        if(target.className == "fa fa-trash-o"&&target.parentNode.tagName.toLowerCase() == "h2"){
            var res = confirm("确定删除此主分类？");
            if(res){
                cateDelete(event);
            }
        }
        else if(target.className == "fa fa-trash-o"&&target.parentNode.tagName.toLowerCase() =="h3"){
            var res = confirm("确定删除此子分类？");
            if(res){
                childCateDelete(event);
            }
        }
        else if(target.tagName.toLowerCase() == 'h2'||target.parentNode.tagName.toLowerCase() == 'h2'){
            cateClick(target);
        }
        else if(target.tagName.toLowerCase() == 'h3'||target.parentNode.tagName.toLowerCase() == 'h3'){
            childCateClick(target);
        }
    });
    EventUtil.addHandler(document.querySelector('.status'),"click",function(event){//任务栏上方status部分点击事件
        event = EventUtil.getEvent(event);
        var target = EventUtil.getTarget(event);
        if(target.className.toLowerCase() == 'statusbutton'||target.parentNode.className.toLowerCase() == "statusbutton"){
            statusClick(target);
        }
    });
    EventUtil.addHandler(document.querySelector('.task-list'),"click",function(event){//任务栏部分事件委托
        event = EventUtil.getEvent(event);
        var target = EventUtil.getTarget(event);
        
        taskDisplay();
        if(target.className == "fa fa-trash-o"&&target.parentNode.tagName.toLowerCase() == 'li'){
            var res = confirm("确定删除此任务？");
            if(res){
                taskDelete(event);
            }
        }
        else if(target.tagName.toLowerCase() == 'li'||target.parentNode.tagName.toLowerCase() == 'li'){
            taskClick(target);
        }
    })
    EventUtil.addHandler(document.querySelector('.addtask'),"click",function(event){//增加任务的点击事件
        event =EventUtil.getEvent(event);
        var target = EventUtil.getTarget(event);//要获取到点击的是哪个分类的任务，需要获取点击的元素
        clickAddTask();
    });
    EventUtil.addHandler(document.querySelector('.set'),"click",function(event){
        event = EventUtil.getEvent(event);
        var target = EventUtil.getTarget(event);
        if(target.className == 'fa fa-check-square-o'){
            var res = confirm("确定标记为已完成？");
            if(res){
                taskEditFinish();
            }
        }
        else if (target.className == "fa fa-pencil-square-o"){            
            taskEdit();
            var chooseTaskEle = queryChooseTask();
            var chooseTaskId = chooseTaskEle.getAttribute('taskid');
            var chooseTask = queryTaskById(chooseTaskId);
            document.querySelector('#inputTitle').value = chooseTask.name;
            document.querySelector('#inputDate').value = chooseTask.date;
            document.querySelector('#inputContent').value = chooseTask.content;
            document.querySelector('#save').id = 'edit';
        }
    });
    EventUtil.addHandler(document.querySelector('#exit'),"click",function(event){
        taskDisplay();
    });
    EventUtil.addHandler(document.querySelector('#buttonArea'),"click",function(event){
        event =EventUtil.getEvent(event);
        var target = EventUtil.getTarget(event);
        if(target.id == 'edit'){
            taskRevise();
        }
        else if(target.id == 'save'){
            taskSave();
        }
    });
    
    
    function initDataBase(){
        var cate = [
        {
            id: 0,
            name: '默认主分类',
            child: [0]
        }
//        {
//            id: 1,
//            name: '学习',
//            child:[1]
//        },
//        {
//            id: 2,
//            name: '生活',
//            child:[]
//        }
        ];
        var childCate = [
        {
            id: 0,
            name: '默认子分类',
            child: [0]
        }
//        {
//            id: 1,
//            name: '看javascript',
//            child: [1]
//        }
        ];
        var task = [{
            id: 0,
            pid: 0,
            name: '使用说明',
            finish: true,
            date:'2017-01-01',
            content: "内容1231241243143"
        }];
        if(!localStorage.init){
            localStorage.cate = JSON.stringify(cate);
            localStorage.childCate = JSON.stringify(childCate);
            localStorage.task = JSON.stringify(task);
            localStorage.init = true;
        }
        
        
    }
    function initLeftContent(){
        var chooseEle = queryChooseCate();
        var cate = JSON.parse(localStorage.cate);
        var childCate = JSON.parse(localStorage.childCate);
        var leftContent = document.querySelector('.left-content');
        var cateContent = document.getElementById('cate-content');
        var unfinishTasks = queryUnfinishedTask();
        console.log(unfinishTasks);
        document.getElementById('unfinishTasks').innerHTML = '('+unfinishTasks.length+')';
        var arr = [];
        var html = '';
        for (var i=0;i<cate.length;i++){
            if(i == 0){
                html += '<li><h2 cateid=0><i class="fa fa-folder-open"></i>默认主分类<span>(0)</span></h2>'+
                        '<ul><li><h3 childid=0><i class="fa fa-file-o"></i>默认子分类<span>(0)</span></h3></li></ul></li>';
            }else{
                var unfinishCate = 0;
                for(var k=0;k<unfinishTasks.length;k++){
                    if(cate[i].child.indexOf(unfinishTasks[k].pid)>=0){
                        unfinishCate++;
                    }
                }
                html += '<li><h2 cateid='+cate[i].id+'><i class="fa fa-folder-open"></i>'+cate[i].name+'<span>('+unfinishCate+')</span><i class="fa fa-trash-o"></i></h2>';
                for(j=0;j<cate[i].child.length;j++){
                    var childCateId = cate[i].child[j];
                    var unfinishChild = 0;
                    for(var k=0;k<unfinishTasks.length;k++){
                        if(unfinishTasks[k].pid == childCateId){
                            unfinishChild++;
                        }
                    }
                    html += '<ul><li><h3 childid='+childCateId+'><i class="fa fa-file-o"></i>'+childCate[childCateId].name+'<span>('+unfinishChild+')</span><i class="fa fa-trash-o"></i></h3></li></ul>';
                }                    
            }
            html += '</li>';
        }
        cateContent.innerHTML = html;
        
        if(chooseEle){
            var chooseEleTag = chooseEle.tagName.toLowerCase();
//            console.log(chooseEleTag);
            var mark = false;
            if(chooseEleTag == 'div'){
                addClass(document.querySelector('#alltask'),'active');
            }
            else if(chooseEleTag == 'h2'){
                var chooseCateId = chooseEle.getAttribute('cateid');
                var allH2 = cateContent.getElementsByTagName('h2');
                for(i=0;i<allH2.length;i++){
                    if(allH2[i].getAttribute('cateid') == chooseCateId){
                        addClass(allH2[i],'active');
                        mark = true;
                        break;
                    }
                }
                if(!mark){
                    addClass(document.querySelector('#alltask'),'active');
                }
            }
            else if(chooseEleTag == 'h3'){
                console.log(chooseEleTag);
                var chooseChildId = chooseEle.getAttribute('childid');
                var allH3 = cateContent.getElementsByTagName('h3');
                for(i=0;i<allH3.length;i++){
                    if(allH3[i].getAttribute('childid') == chooseChildId){
                        addClass(allH3[i],'active');
                        mark = true;
                        break;
                    }
                }
                if(!mark){
                    addClass(document.querySelector('#alltask'),'active');
                }
            }
            else{
                addClass(document.querySelector('#alltask'),'active');
            }
        }
        else{
            addClass(document.querySelector('#alltask'),'active');
        }
        initTaskList();
    }
    function initTaskList(){
        var chooseEle = queryChooseTask();
        var date = [];
        var html = '';
        var chooseStatus = queryChooseStatus();
        var taskList = document.querySelector('.task-list');
        var task = queryTaskByStatus(chooseStatus.getAttribute('id'));
        for(var i=0;i<task.length;i++){
            if(date.indexOf(task[i].date)<0){
                date.push(task[i].date);
            }
        }
        date = date.sort(sortDate);
        for(var i=0;i<date.length;i++){
            var dateObj = {
                date : date[i],
                task : []
            };
            for(var j=0;j<task.length;j++){
                if(task[j].date == date[i]){
                    dateObj.task.push(task[j]);
                }
            }
//            console.log(date[i]);
//            console.log(dateObj);
            html += '<div>'+dateObj.date+'</div><ul>';
            for(var k=0;k<dateObj.task.length;k++){
//                console.log(dateObj.task[k].finish);
                if(dateObj.task[k].finish){
                    html += '<li taskid='+dateObj.task[k].id+'><i class="fa fa-check"></i>'+dateObj.task[k].name+'<i class="fa fa-trash-o"></i></li>';
                }else{
                    html += '<li taskid='+dateObj.task[k].id+'>'+dateObj.task[k].name+'<i class="fa fa-trash-o"></i></li>';
                }
            }
            html +='</ul>';
        }
        taskList.innerHTML = html;
        console.log(chooseEle);
        if(chooseEle){//如果之前有选中的task任务
            var chooseEleId = chooseEle.getAttribute('taskid');
            var allLi = taskList.getElementsByTagName('li');
            var findLi = false;
            for(i=0;i<allLi.length;i++){
                if(allLi[i].getAttribute('taskid') == chooseEleId){
                    addClass(allLi[i],'active');
                    findLi = true;
                    break;
                }
            }
            if(!findLi){
                var firstLi = taskList.getElementsByTagName('li')[0];
                if(firstLi){
                addClass(firstLi,'active');
                }
            }
        }else{
            var firstLi = taskList.getElementsByTagName('li')[0];
            if(firstLi){//如果所有任务都删除了，不存在li,避免报错
                addClass(firstLi,'active');
            }
        }
        initTaskContent();
    }
    function initTaskContent(){
        var chooseTask = queryChooseTask();
        console.log(chooseTask);
        if(chooseTask){
            var set = document.querySelector('.set');
            var chooseTaskName = queryTaskById(chooseTask.getAttribute('taskid')).name;
            var chooseTaskDate = queryTaskById(chooseTask.getAttribute('taskid')).date;
            var chooseTaskContent = queryTaskById(chooseTask.getAttribute('taskid')).content;
            var chooseTaskFinish = queryTaskById(chooseTask.getAttribute('taskid')).finish;
            console.log(chooseTaskFinish);
            if(chooseTaskFinish == true){
                set.style.display = 'none';
            }else{
                set.style.display = 'block';
            }
            document.getElementById('display-title').innerHTML = chooseTaskName;
            document.getElementById('display-date').innerHTML = chooseTaskDate;
            document.getElementById('display-content').innerHTML = chooseTaskContent;
        }
    }
    function queryUnfinishedTask(){
        var allTask = JSON.parse(localStorage.task); 
        var arr = [];
        for(var i=0;i<allTask.length;i++){
            if(allTask[i].finish == false){
                arr.push(allTask[i]);
            }
        }
        return arr;
    }
    function clickAllTask(){
        var leftContent = document.querySelector('.left-content');
        clearActive(leftContent);
        var allTask = document.querySelector('#alltask');
        addClass(allTask,'active');    
        statusToAll();
    }
    function clickAddCate(){
        var cover = document.getElementById('cover');
        cover.style.display = "block";
        taskDisplay();
        var allCates = JSON.parse(localStorage.cate);
        var addCates = document.getElementById('addCates');
        var html = '';
        html += '<option value=-1>新增主分类</option>';
        for(i=0;i<allCates.length;i++){
            html += '<option value='+allCates[i].id+'>'+allCates[i].name+'</option>';
        }
        addCates.innerHTML = html;
    }
    function clickAddTask(){
        var oldChoose = document.querySelector('.left-content .active');
        var tag = oldChoose.tagName.toLowerCase();
        if(tag == 'h3' && oldChoose.getAttribute('childid') == 0){
            alert('默认子分类不能添加任务');
        }
        else if (tag == 'h3'){
            if(document.querySelector('#edit')){
                document.querySelector('#edit').id = 'save';
            }
            taskEdit();
        }
        else{
            alert('请先建立子分类再添加任务');
        }
    }
    function cateAdd(){
        var allCates = JSON.parse(localStorage.cate);
        var allChildCates = JSON.parse(localStorage.childCate);
        var addCatesId = document.getElementById('addCates').value;
//        console.log(addCatesId);
        var newCateName = document.getElementById('newCateName').value;
        if(newCateName.length == 0){
            alert('请输入分类名称');
        }
        else if(newCateName.length >20){
            alert('输入的分类名称过长');
        }
        else if(judgeExistAttr(allCates,'name',newCateName)){
            alert('已存在此主分类名');
        }
        else if(judgeExistAttr(allChildCates,'name',newCateName)){
            alert('已存在此子分类名');
        }
        else if(addCatesId == 0){
            alert('不能为默认主分类添加子分类');
        }
        else if(addCatesId == -1){//添加主分类
            var newCate = {
                id: allCates[allCates.length-1].id+1,
                name: newCateName,
                child: []
            };
            allCates.push(newCate);
            localStorage.cate = JSON.stringify(allCates);
            initLeftContent();
            coverHide();
        }
        else if(addCatesId >0){//添加子分类
            var cate = queryCateById(addCatesId);
            var newChildCate = {
                id: allChildCates.length,
                name: newCateName,
                child: []
            }
            cate.child.push(newChildCate.id);
            for(i=0;i<allCates.length;i++){
                if(allCates[i].id == addCatesId){
                    allCates[i] = cate;
                    break;
                }
            }
            allChildCates.push(newChildCate);
            localStorage.cate = JSON.stringify(allCates);
            localStorage.childCate = JSON.stringify(allChildCates);
            initLeftContent();
            coverHide();
        }
    }
    function coverHide(){
        var cover = document.getElementById('cover');
        var newCateName = document.getElementById('newCateName');
        newCateName.value = '';
        cover.style.display = "none";
    }
    function statusClick(target){
        var status = document.querySelector('.status');
        clearActive(status);
        addClass(target,'active');
        initTaskList();
    }
    function cateClick(target){
        var leftContent = document.querySelector('.left-content');
        clearActive(leftContent);
        if(target.tagName.toLowerCase() == 'h2'){
            addClass(target,'active');
        }
        else if(target.parentNode.tagName.toLowerCase() == 'h2'){
            addClass(target.parentNode,'active');
        }
        statusToAll();
    }
    function childCateClick(target){
        var leftContent = document.querySelector('.left-content');
        clearActive(leftContent);
        if(target.tagName.toLowerCase() == 'h3'){
            addClass(target,'active');
        }
        else if(target.parentNode.tagName.toLowerCase() == 'h3'){
            addClass(target.parentNode,'active');
        }
        statusToAll();
    }
    function cateDelete(event){
        window.event ? window.event.cancelBubble=true : event.stopPropagation();
        var event = EventUtil.getEvent(event);
        var target = EventUtil.getTarget(event);
        var allCate = JSON.parse(localStorage.cate);
        var allChildCate = JSON.parse(localStorage.childCate);
        var allTask = JSON.parse(localStorage.task);
        var deleteCateId = target.parentNode.getAttribute('cateid');
        console.log(deleteCateId);
        var deleteCate = queryCateById(deleteCateId);
        console.log(deleteCate);
        for(var i=0;i<allCate.length;i++){
            if(allCate[i].id == deleteCateId){
                allCate.splice(i,1);
                break;
            }
        }
        if(deleteCate.child){
            var deleteChildArr =deleteCate.child;
            for(var i=0;i<allChildCate.length;i++){
                if(deleteChildArr.indexOf(allChildCate[i].id)>=0){
                    allChildCate.splice(i,1);
                    i--;
                }
            }
            for(var i=0;i<allTask.length;i++){
                if(deleteChildArr.indexOf(allTask[i].pid)>=0){
                    allTask.splice(i,1);
                    i--;
                }
            }
            localStorage.childCate = JSON.stringify(allChildCate);
            localStorage.task = JSON.stringify(allTask);
        }
        localStorage.cate = JSON.stringify(allCate);
        initLeftContent();
    }
    function childCateDelete(event){
        window.event ? window.event.cancelBubble =true : event.stopPropagation();
        var event = EventUtil.getEvent(event);
        var target = EventUtil.getTarget(event);      
        var allCate = JSON.parse(localStorage.cate);
        var allChildCate = JSON.parse(localStorage.childCate);
        var allTask = JSON.parse(localStorage.task);
        var deleteChildId = target.parentNode.getAttribute('childid');
        var deleteChild = queryChildCateById(deleteChildId);
        for(var i=0;i<allChildCate.length;i++){
            if(allChildCate[i].id == deleteChild.id){
                allChildCate.splice(i,1);
                break;
            }
        }
        for(var i=0;i<allCate.length;i++){
            if(allCate[i].child){
                console.log(allCate[i].child);
                var index = allCate[i].child.indexOf(deleteChild.id);
                if(index >= 0){
                    allCate[i].child.splice(index,1);
                    break;
                }
            }
        }
        for(var i=0;i<allTask.length;i++){
            if(allTask[i].pid == deleteChildId){
                allTask.splice(i,1);
                i--;
            }
        }
        localStorage.cate = JSON.stringify(allCate);
        localStorage.childCate = JSON.stringify(allChildCate);
        localStorage.task = JSON.stringify(allTask);
        initLeftContent();
        
    }
    function taskClick(target){
        var taskList = document.querySelector('.task-list');
        clearActive(taskList);
        addClass(target,'active');
        initTaskContent();
    }
    function taskDelete(event){
        window.event ? window.event.cancelBubble =true : event.stopPropagation();
        var event = EventUtil.getEvent(event);
        var target = EventUtil.getTarget(event);
        var allChildCate = JSON.parse(localStorage.childCate);
        var allTask = JSON.parse(localStorage.task);
        var deleteTaskId = target.parentNode.getAttribute('taskid');
        var deleteTask = queryTaskById(deleteTaskId);
        for(var i=0;i<allTask.length;i++){
            if(allTask[i].id == deleteTask.id){
                allTask.splice(i,1);
                break;
            }
        }
        for(var i=0;i<allChildCate.length;i++){
            if(allChildCate[i].id == deleteTask.pid){
                var index = allChildCate[i].child.indexOf(deleteTask.id);
                allChildCate[i].child.splice(index,1);
                break;
            }
        }
        localStorage.childCate = JSON.stringify(allChildCate);
        localStorage.task = JSON.stringify(allTask);
        initTaskList();
    }
    function taskRevise(){
        var chooseTaskEle = queryChooseTask();
        var chooseTaskId = chooseTaskEle.getAttribute('taskid');
        var chooseTask = queryTaskById(chooseTaskId);
        var newTitle = document.querySelector('#inputTitle').value;
        var newDate = document.querySelector('#inputDate').value;
        var newContent = document.querySelector('#inputContent').value;
        var allTask = JSON.parse(localStorage.task);
        var judgeTitleExist = judgeExistAttr(allTask,'name',newTitle);
        if(judgeTitleExist && judgeTitleExist.id != chooseTaskId){
            alert('已存在此任务名');
        }else{
            var revisedTask = {
                id: chooseTaskId,
                pid: chooseTask.pid,
                name: newTitle,
                finish: chooseTask.finish,
                date: newDate,
                content: newContent
            }
            for(var i=0;i<allTask.length;i++){
                if(allTask[i].id == chooseTaskId){
                    allTask[i] = revisedTask;
                    break;
                }
            }
            localStorage.task = JSON.stringify(allTask);
            initTaskList();
            taskDisplay();
        }

    }
    function taskSave(){
        var oldChoose = document.querySelector('.left-content .active');
        var pId = oldChoose.getAttribute('childid');
        var allChildCate = JSON.parse(localStorage.childCate);
        var allTask = JSON.parse(localStorage.task);
        var newTitle = document.querySelector('#inputTitle').value;
        var newDate = document.querySelector('#inputDate').value;
        var newContent = document.querySelector('#inputContent').value;
        var taskList = document.querySelector('.task-list');
        if(newTitle.length == 0){
            alert('请输入任务名称');
        }
        else if(newTitle.length > 20){
            alert('任务名称过长');
        }
        else if(judgeExistAttr(allTask,'name',newTitle)){
            alert('任务名称已存在');
        }
        else if(newDate.length == 0){
            alert('请选择任务日期');
        }
        else if(newContent.length == 0){
            alert('请填写任务内容');
        }
        else{
            var newTask = {
                id: allTask.length,
                pid: parseInt(pId),
                name: newTitle,
                finish: false,
                date: newDate,
                content: newContent
            };
//            console.log(newTask);
            var chooseChild = queryChildCateById(pId);
            chooseChild.child.push(newTask.id);
            console.log(chooseChild);
            allTask.push(newTask);
            for(var i=0;i<allChildCate.length;i++){
                if(allChildCate[i].id == newTask.pid){
                    allChildCate[i] = chooseChild;
                    break;
                }
            }
            localStorage.childCate = JSON.stringify(allChildCate);
            localStorage.task = JSON.stringify(allTask);
            clearActive(taskList);
            var allLi = taskList.getElementsByTagName('li');
            for(var i=0;i<allLi.length;i++){
                if(allLi[i].getAttribute('taskid') == newTask.id){
                    addClass(allLi[i],'active');
                    break;
                }
            }
            statusToAll();
            initLeftContent();
            taskDisplay();
        }
    }
    function taskEditFinish(){
        var allTask = JSON.parse(localStorage.task);
        var chooseTask = queryChooseTask();
        var chooseTaskId = chooseTask.getAttribute('taskid');
        var chooseTaskObj = queryTaskById(chooseTaskId);
        chooseTaskObj.finish = true;
        for(i=0;i<allTask.length;i++){
            if(allTask[i].id == chooseTaskId){
                allTask[i] = chooseTaskObj;
                console.log(chooseTaskObj);
                break;
            }
        }
        localStorage.task = JSON.stringify(allTask);
//        var html = '';
//        html += '<i class="fa fa-check"></i>'+chooseTaskObj.name+'<i class="fa fa-trash-o"></i>';
//        chooseTask.innerHTML = html;
        var set = document.querySelector('.set');
        set.style.display = 'none';
        statusToAll();
        initLeftContent();
    }
    function taskDisplay(){
        document.querySelector('#inputTitle').value = '';
        document.querySelector('#inputDate').value = '';
        document.querySelector('#inputContent').value = '';
        document.querySelector('.rightEdit').style.display = 'none';
        document.querySelector('.right').style.display = 'block';
    }
    function taskEdit(){
        document.querySelector('.rightEdit').style.display = 'block';
        document.querySelector('.right').style.display = 'none';
    }
    function queryAllTaskArray(){
        var arr = [];
        var chooseCate = queryChooseCate();
        if(chooseCate.tagName.toLowerCase() == 'div'){
            arr = JSON.parse(localStorage.task);
            return arr;
        }
        else if(chooseCate.tagName.toLowerCase() == 'h2'){
            var cateId = chooseCate.getAttribute('cateid');
            var chooseCate = queryCateById(cateId);
            for(var i=0;i<chooseCate.child.length;i++){
                var childCateId = chooseCate.child[i];
                var childCate = queryChildCateById(childCateId);
                console.log(childCate);
                for(j=0;j<childCate.child.length;j++){
                    arr.push(queryTaskById(childCate.child[j]));
                }                
            }
            return arr;            
        }
        else if(chooseCate.tagName.toLowerCase() == 'h3'){
            var childCateId = chooseCate.getAttribute('childid');
            var chooseChildCate = queryChildCateById(childCateId);
            for(var i=0;i<chooseChildCate.child.length;i++){
                arr.push(queryTaskById(chooseChildCate.child[i]));
            }
            return arr;
        }
        
    }
    function queryCateById(cateId){
        var cate = JSON.parse(localStorage.cate);
        for(var i=0;i<cate.length;i++){
            if(cate[i].id == cateId){
                return cate[i];
            }
        }
    }
    function queryChildCateById(childCateId){
        var childCate = JSON.parse(localStorage.childCate);
        for(var i=0;i<childCate.length;i++){
            if(childCate[i].id == childCateId){
                return childCate[i];
            }
        }
    }
    function queryTaskById(taskId){
        var task = JSON.parse(localStorage.task);
        for(var i=0;i<task.length;i++){
            if(task[i].id == taskId){
                return task[i];
            }
        }
    }
    function queryTaskByStatus(status){
        var allTask = queryAllTaskArray();
//        console.log(allTask);
        var arr = [];
        if(status == 'all'){
            return allTask;
        }
        else if(status == 'unfinish'){
            for(var i=0;i<allTask.length;i++){
                if(!allTask[i].finish){
                    arr.push(allTask[i]);
                }
            }
            return arr;
        }
        else if (status == 'finished'){
            for(var i=0;i<allTask.length;i++){
                if(allTask[i].finish){
                    arr.push(allTask[i]);
                }
            }
            return arr;
        }
        
    }
    function statusToAll(){
        var status = document.querySelector('.status');
        clearActive(status);
        addClass(document.querySelector('#all'),'active');
        initTaskList();
    }
    function clearActive(content){
        var activeElement = content.getElementsByClassName('active')[0];
        removeClass(activeElement,'active');
    }
    function judgeExistAttr(a,attr,b){
        for(var i=0;i<a.length;i++){
            if(a[i][attr] == b){
                return a[i];
            }
        }
    }
    function queryChooseCate(){
        return document.querySelector('.left-content .active');
    }
    function queryChooseStatus(){
        return document.querySelector('.status .active');
    }
    function queryChooseTask(){
        return document.querySelector('.task-list .active');
    }
    function sortDate(a,b){
        if(a > b){
            return 1;
        }
        else if (a < b){
            return -1;
        }
        else{
            return 0;
        }
    }
    
}