"ui";
ui.layout(
    <vertical>
        <button id="startButton" text="开始任务" />
        <button id="stopButton" text="停止任务" />
        <text id="statusText" text="任务状态：未开始" />
    </vertical>
);

var athread = null;
var isProcessing = false;
var taskIndex = 0;
var tasks = [1, 3, 2, 34, 123, 12, 3];
var taskTimeout = 20000; // 每个任务的超时时间为20秒
var failedTasks = [];

function logTaskError(task, error) {
    failedTasks.push({
        task: task,
        error: error,
        timestamp: new Date().toISOString()
    });
}

function processTask(task) {
    return new Promise((resolve, reject) => {
        let taskCompleted = false;

        let taskTimeoutId = setTimeout(() => {
            if (!taskCompleted) {
                log(`任务超时: ${task}`);
                logTaskError(task, '超时');
                reject('超时');
            }
        }, taskTimeout);

        try {
            // 模拟任务执行
            log(`执行任务: ${task}`);
            sleep(2000); // 任务处理时间
            taskCompleted = true;
            clearTimeout(taskTimeoutId);
            resolve();
        } catch (error) {
            taskCompleted = true;
            clearTimeout(taskTimeoutId);
            logTaskError(task, error);
            reject(error);
        }
    });
}

function startScript() {
    if (isProcessing) return;

    isProcessing = true;
    taskIndex = 0;
    failedTasks = [];

    athread = threads.start(() => {
        try {
            while (taskIndex < tasks.length && isProcessing) {
                processTask(tasks[taskIndex]).then(() => {
                    log(`任务完成: ${tasks[taskIndex]}`);
                }).catch(error => {
                    log(`任务失败: ${tasks[taskIndex]}, 错误: ${error}`);
                });

                taskIndex += 1;
                sleep(1000); // 每个任务之间的间隔
            }
        } catch (error) {
            logTaskError(tasks[taskIndex], error);
        } finally {
            isProcessing = false;
            ui.run(() => {
                ui.statusText.setText('任务状态：已完成');
            });
            finishTask();
        }
    });
}

function stopScript() {
    if (athread !== null && athread.isAlive()) {
        isProcessing = false;
        athread.interrupt();
        ui.run(() => {
            toastLog(`任务被中断: ${tasks[taskIndex]}`);
        });
        logTaskError(tasks[taskIndex], '被手动终止');
    }
}

function finishTask() {
    log('任务汇总: ', failedTasks);
    ui.run(() => {
        ui.statusText.setText('任务状态：已完成');
    });
}

ui.startButton.on('click', () => {
    ui.statusText.setText('任务状态：进行中...');
    startScript();
});

ui.stopButton.on('click', () => {
    confirm('确认停止任务吗？').then(res => {
        if (res) {
            stopScript();
        }
    }).catch(error => {
        log('停止任务时发生错误:', error);
    });
});
