module.exports = {
    
        create_task: (req,res,next) => {
            console.log('TAEGET REACHED 1')
            let {task_name, task_start_date, task_finished_date, task_user_1, task_description, task_role, task_unique_key, task_show, task_link} = req.body;
            console.log('TAEGET REACHED 2', req.body)
            req.app.get('db').task.add_task(task_name, task_start_date, task_finished_date, task_user_1, task_description, task_role, task_unique_key, task_show, task_link)
            .then(prop => res.status(200).send(prop))
        }
    }