const express = require('express')
const cors = require('cors')
const mysql = require('mysql')
const RandomTextGenerator = require("random-text-generator");
let randomTextGenerator = new RandomTextGenerator();

const app = express();
 
var pool = mysql.createPool({
    connectionLimit: 140,
    host: process.env.JAWSDB_URL,
    user: process.env.user,
	port: process.env.port,
    password: process.env.pass,
    database: process.env.database
});

app.use(express.json());


let tokens = ['3xXcdLDUrs71o8QP',
    'ynC42eaIhjGgOUe2',
    'hUpX9jtkJaictpUN',
    'zJ6zknJ2nm141Ntm',
    '3WOvCutYCMQGsaRi',
    'UotCxNXJfZsuSEHH',
    'mnJO1k92xihzzK0E',
    'hqidx1yblSd7nIhW',
    'bnzlzFAgZOK6g0mh',
    'MI2Yv9raGIdheulo',
    'EKq8gmcpz5fLrgSp',
    'zecIVNZKZg1pVN0M',
    'YrVMXW3yTMoH0UCH',
    '7kBggTFVTEUHwdfa',
    '3P9054uw44xthwsv',
    'zmycGERWEmY8Pkut',
    'reOTwmaESlaZR6rU',
    'htwyNMLV30MC6cAc',
    'aUoZ2TLGNy2aot5b',
    'dTZKWKx0FDtKY9QA']
;
for (let token of tokens) randomTextGenerator.learn(token);

const SELECT_EXAM_BY_MONTH = 'SELECT e.id, e.questions, e.name, e.month,e.passquestion,e.enableExam FROM exams e ,users u where e.month=? and e.username =? and e.username =u.name and u.token =?'
const SELECT_EXAM_BY_USER = 'SELECT e.id, e.questions, e.name, e.month,e.passquestion,e.enableExam FROM exams e ,users u where e.username =? and e.username =u.name and u.token =?'
const SELECT_EXAM_BY_USER_EXAM_NAME = 'SELECT e.id, e.questions, e.name, e.month,e.passquestion,e.enableExam FROM exams e ,users u where e.username =? and e.name=? and e.username =u.name and u.token =?'
const GET_EXAM_COUNT_USER = 'select e.month,count(e.questions) count from exams e ,users u where e.username =? and e.username =u.name and u.token =? group by  e.month,e.questions'
const GET_USER = 'SELECT name, id,school,  token FROM users u where u.name =? and u.password =? ';
const SAVE_USER = ' INSERT INTO users (name, password, token,school) VALUES(?,?,?,?)';
const UPDATE_USER = ' UPDATE users SET  password=? ,school=? WHERE name=?  and token =? '
const SAVE_EXAM = "INSERT INTO exams (questions, name,username, month,passquestion) VALUES(?,?,?,?,?)";
const UPDATE_EXAM = "UPDATE exams SET questions=?,enableExam=?, name=?,username=?, month=?,passquestion=? WHERE id=?";
const UPDATE_EXAM_TYPE='update exams set enableExam=? where id=?';
const USER_GEN_VAIDATE = "select name from users u where u.name =? and u.token =?";
const SAVE_USER_EXAM = "INSERT INTO user_exams (name, attempts, marks, saveEnabled, school, examname) VALUES(?, ?, ?, ?, ?, ?)";
const GET_USER_EXAM = "SELECT ID from user_exams where name=? and examname= ? ";
const GET_USER_EXAM_TAKEN = "SELECT id, name, attempts, marks, saveEnabled, school, examname FROM user_exams where examname=?";
const GET_EXAM = "SELECT id, questions, name, month, passquestion, enableExam FROM exams where name=? and enableExam =1";
const GET_TAKE_EXAM ="SELECT id, questions, name, month, passquestion, enableExam FROM exams WHERE month=(SELECT DATE_FORMAT(CURRENT_DATE(), '%b') from DUAL)   and enableExam =1";
app.use(cors())

app.post('/user/exam/getExam', function (req, res) {
    pool.getConnection((err, connection) => {
        if (err) {
            return res.json(
                {
                    code: 505,
                    message: err
                }
            );
        } else {
            var requestBody = req.body;
            if (requestBody == null || (requestBody != null && requestBody.user == null || requestBody.examname == null || requestBody.token == null)) {
                return res.json(
                    {
                        code: 501,
                        message: 'Mandatory params missing  either user |  examname | token'
                    }
                );
            }
            let monthCount =  {
                jan:0,
                feb:0,
                mar:0,
                apr:0,
                may:0,
                jun:0,
                jul:0,
                aug:0,
                sep:0,
                oct:0,
                nov:0,
                dec:0,
            };
            connection.query(GET_EXAM_COUNT_USER, [requestBody.user, requestBody.token], function (err, results, fields) {

                if (err) {
                    return res.json(
                        {
                            code: 505,
                            message: err
                        }
                    );
                } else {

                    results.forEach(function (elem) {
                        switch (elem.month) {
                            case'jan':monthCount.jan=elem.count;  break;case'feb':monthCount.feb=elem.count; break;case'mar': monthCount.mar=elem.count;break;case'apr': monthCount.apr=elem.count;break;
                            case'may': monthCount.may=elem.count;break;case'jun': monthCount.jun=elem.count;break;case'jul': monthCount.jul=elem.count;break;case'aug': monthCount.aug=elem.count;break;
                            case'sep': monthCount.sep=elem.count;break;case'oct': monthCount.oct=elem.count;break;case'nov': monthCount.nov=elem.count;break;case'dec': monthCount.dec=elem.count;break;
                        }

                    });
                }
            })
            connection.query(SELECT_EXAM_BY_USER_EXAM_NAME, [requestBody.user,requestBody.examname, requestBody.token], function (err, results, fields) {
                if (err) {
                    return res.json(
                        {
                            code: 505,
                            message: err
                        }
                    );
                } else {
                    let data = [];
                    results.forEach(function (elem) {
                        data.push({
                            enableExam:elem.enableExam,
                            id: elem.id,
                            name: elem.name,
                            month: elem.month,
                            passquestion: elem.passquestion,
                            questions: JSON.parse(elem.questions)
                        });
                    });
                    return res.json(
                        {
                            code: 200,
                            message: 'success',
                            data: {
                                months: monthCount,
                                exams: data
                            }
                        }
                    );
                }

            });
        }

    });
});

app.post('/user/update/exam', function (req, res) {
    pool.getConnection((err, connection) => {
        if (err) {
            return res.json(
                {
                    code: 505,
                    message: err
                }
            );
        } else {

            var requestBody = req.body;
            if (requestBody == null || (requestBody != null && requestBody.user == null || requestBody.flag == null|| requestBody.id == null|| requestBody.token == null )) {
                return res.json(
                    {
                        code: 501,
                        message: err
                    }
                );
            }
            connection.query(USER_GEN_VAIDATE, [requestBody.flag,requestBody.id], function (err, results, fields) {
                if (err) {
                    return res.json(
                        {
                            code: 505,
                            message: err
                        }
                    );
                } else {

                    if ((results[0] != null)) {
                        return res.json(
                            {
                                code: 506,
                                message: 'Not Valid user'
                            }
                        );
                    }
                    connection.query(UPDATE_EXAM_TYPE, [requestBody.flag,requestBody.id ], function (err, results, fields) {
                        if (err) {
                            return res.json(
                                {
                                    code: 505,
                                    message: err
                                }
                            );
                        } else {
                            return res.json(
                                {
                                    code: 200,
                                    message: 'Status Updated',
                                }
                            );
                        }
                    });
                }

            });

        }
    });
});

app.post('/user/getSudenExams', function (req, res) {
    pool.getConnection((err, connection) => {
        if (err) {
            return res.json(
                {
                    code: 505,
                    message: err
                }
            );
        } else {
            var requestBody = req.body;

            if (requestBody == null || (requestBody != null && requestBody.examname == null)) {
                return res.json(
                    {
                        code: 501,
                        message: 'Mandatory params missing  either examname'
                    }
                );
            }
            connection.query(GET_USER_EXAM_TAKEN, [requestBody.examname], function (err, results, fields) {
                if (err) {
                    return res.json(
                        {
                            code: 505,
                            message: err
                        }
                    );
                } else {
                    let data = [];
                    results.forEach(function (elem) {
                        data.push({
                            id: elem.id,
                            name: elem.name,
                            attempts: elem.attempts,
                            saveEnabled: elem.saveEnabled,
                            school: elem.school,
                            examname: elem.examname,
                            marks: JSON.parse(elem.marks)
                        });
                    })
                    return res.json(
                        {
                            code: 200,
                            message: 'success',
                            data: data
                        }
                    );
                }

            });
        }

    });
});

app.post('/user/exam/gettest', function (req, res) {
    pool.getConnection((err, connection) => {
        if (err) {
            return res.json(
                {
                    code: 505,
                    message: err
                }
            );
        } else {

            var requestBody = req.body;
			
            if (requestBody == null || (requestBody != null && requestBody.examname == null)) {
                return res.json(
                    {
                        code: 501,
                        message: 'Mandatory params missing  wither questions | examname '
                    }
                );
            }
			//console.log(requestBody)
			var query=GET_EXAM;
			if(requestBody.examname==''){
				
				query=GET_TAKE_EXAM;
			}
				//console.log(query)
            connection.query(query, [requestBody.examname], function (err, results, fields) {
                if (err) {
                    return res.json(
                        {
                            code: 505,
                            message: err
                        }
                    );
                } else {

                    let data = [];
                    results.forEach(function (elem) {
                        data.push({
                            enableExam:elem.enableExam,
                            id: elem.id,
                            name: elem.name,
                            month: elem.month,
                            passquestion: elem.passquestion,
                            questions: JSON.parse(elem.questions)
                        });
                    })
                    return res.json(
                        {
                            code: 200,
                            message: 'success',
                            data: data
                        })
                }

            });

        }
    });
});


app.post('/user/save/test', function (req, res) {
	//console.log(req.body)
    pool.getConnection((err, connection) => {
        if (err) {
            return res.json(
                {
                    code: 505,
                    message: err
                }
            );
        } else {

            var requestBody = req.body;
			
            if (requestBody == null || (requestBody != null && requestBody.attempts == null || requestBody.user == null || requestBody.marks == null || requestBody.saveEnabled == null || requestBody.school == null || requestBody.examname == null)) {
                return res.json(
                    {
                        code: 501,
                        message: err
                    }
                );
            }
            connection.query(GET_USER_EXAM, [requestBody.user, requestBody.examname], function (err, results, fields) {
                if (err) {
                    return res.json(
                        {
                            code: 505,
                            message: err
                        }
                    );
                } else {

                    if ((results[0] != null)) {
                        return res.json(
                            {
                                code: 506,
                                message: 'You cannot re attemp exam once submitted'
                            }
                        );
                    }
                    connection.query(SAVE_USER_EXAM, [requestBody.user, requestBody.attempts, JSON.stringify(requestBody.marks), requestBody.saveEnabled, requestBody.school, requestBody.examname], function (err, results, fields) {
                        //console.log(requestBody);
						//console.log(err);
						
						if (err) {
                            return res.json(
                                {
                                    code: 505,
                                    message: err
                                }
                            );
                        } else {
                            return res.json(
                                {
                                    code: 200,
                                    message: 'Marks Saved',
                                }
                            );
                        }
                    });
                }

            });

        }
    });
});

app.post('/user/saveExam', function (req, res) {
    pool.getConnection((err, connection) => {
        if (err) {
            return res.json(
                {
                    code: 505,
                    message: err
                }
            );
        } else {

            var requestBody = req.body;
		 
            if (requestBody == null || (requestBody != null && (requestBody.questions == null || requestBody.user == null || requestBody.month == null || requestBody.token == null))) {
                return res.json(
                    {
                        code: 501,
                        message: 'Mandatory params missing  wither questions | user  | month | token '
                    }
                );
            }
			
            connection.query(USER_GEN_VAIDATE, [requestBody.user, requestBody.token], function (err, results, fields) {
                if (err) {
                    return res.json(
                        {
                            code: 505,
                            message: err
                        }
                    );
                } else {

                    if ((results[0] == null)) {
                        return res.json(
                            {
                                code: 501,
                                message: 'invalid Data provided with user or token'
                            }
                        );
                    }
                    connection.query(SAVE_EXAM, [JSON.stringify(requestBody.questions), requestBody.name, requestBody.user, requestBody.month, requestBody.passquestion], function (err, results, fields) {
                        if (err) {
                            return res.json(
                                {
                                    code: 505,
                                    message: err
                                }
                            );
                        } else {
                            return res.json(
                                {
                                    code: 200,
                                    message: 'success',
                                }
                            );
                        }
                    });
                }

            });

        }
    });
});


app.post('/user/updateExam', function (req, res) {
    pool.getConnection((err, connection) => {
        if (err) {
            return res.json(
                {
                    code: 505,
                    message: err
                }
            );
        } else {

            var requestBody = req.body.data;
            //console.log(requestBody)
            if (requestBody == null || (requestBody != null &&( requestBody.id == null || requestBody.questions == null || requestBody.user == null || requestBody.month == null || requestBody.token == null))) {
                return res.json(
                    {
                        code: 501,
                        message: 'Mandatory params missing  wither questions | name  | month | token | id'
                    }
                );
            }
            connection.query(USER_GEN_VAIDATE, [requestBody.user, requestBody.token], function (err, results, fields) {
                if (err) {
                    return res.json(
                        {
                            code: 505,
                            message: err
                        }
                    );
                } else {

                    if ((results[0] == null)) {
                        return res.json(
                            {
                                code: 501,
                                message: 'invalid Data provided with user or token'
                            }
                        );
                    }
                    connection.query(UPDATE_EXAM, [JSON.stringify(requestBody.questions), requestBody.enableExam, requestBody.name, requestBody.user, requestBody.month, requestBody.passquestion, requestBody.id], function (err, results, fields) {
                        if (err) {
                            return res.json(
                                {
                                    code: 505,
                                    message: err
                                }
                            );
                        } else {
                            return res.json(
                                {
                                    code: 200,
                                    message: 'Success'
                                }
                            );
                        }
                    });
                }

            });

        }
    });
});

app.post('/user/getExamByMonth', function (req, res) {
    pool.getConnection((err, connection) => {
        if (err) {
            return res.json(
                {
                    code: 505,
                    message: err
                }
            );
        } else {
            var requestBody = req.body;
            if (requestBody == null || (requestBody != null && requestBody.month == null || requestBody.user == null || requestBody.token == null)) {
                return res.json(
                    {
                        code: 501,
                        message: 'Mandatory params missing  eirther user | monthg  | token'
                    }
                );
            }
            connection.query(SELECT_EXAM_BY_MONTH, [requestBody.month, requestBody.user, requestBody.token], function (err, results, fields) {
                if (err) {
                    return res.json(
                        {
                            code: 505,
                            message: err
                        }
                    );
                } else {
                    return res.json(
                        {
                            code: 200,
                            message: 'success',
                            data: {
                                id: results[0].id,
                                name: results[0].name,
                                month: results[0].month,
                                passquestion: results[0].passquestion,
                                questions: JSON.parse(results[0].questions)
                            }
                        }
                    );
                }

            });
        }

    });
});


app.post('/user/getExams', function (req, res) {
    pool.getConnection((err, connection) => {
        if (err) {       
            return res.json(
                {
                    code: 505,
                    message: err
                }
            );
        } else {
            var requestBody = req.body;
            if (requestBody == null || (requestBody != null && requestBody.user == null || requestBody.token == null)) {
                 
                return res.json(
                    {
                        code: 501,
                        message: err
                    }
                );
            }
            let monthCount =  {
                Jan:0,
                Feb:0,
                Mar:0,
                Apr:0,
                May:0,
                Jun:0,
                Jul:0,
                Aug:0,
                Sep:0,
                Oct:0,
                Nov:0,
                Dec:0,
            };
            connection.query(GET_EXAM_COUNT_USER, [requestBody.user, requestBody.token], function (err, results, fields) {

                if (err) {
                    return res.json(
                        {
                            code: 505,
                            message: err
                        }
                    );
                } else {
                    results.forEach(function (elem) {
                        switch (elem.month) {
                            case'Jan':monthCount.Jan=elem.count;  break;case'Feb':monthCount.Feb=elem.count; break;case'Mar': monthCount.Mar=elem.count;break;case'Apr': monthCount.Apr=elem.count;break;
                            case'May': monthCount.May=elem.count;break;case'Jun': monthCount.Jun=elem.count;break;case'Jul': monthCount.Jul=elem.count;break;case'Aug': monthCount.Aug=elem.count;break;
                            case'Sep': monthCount.Sep=elem.count;break;case'Oct': monthCount.Oct=elem.count;break;case'Nov': monthCount.Nov=elem.count;break;case'Dec': monthCount.Dec=elem.count;break;
                        }

                    });
                }
            })
            connection.query(SELECT_EXAM_BY_USER, [requestBody.user, requestBody.token], function (err, results, fields) {
                if (err) {
                    return res.json(
                        {
                            code: 505,
                            message: err
                        }
                    );
                } else {

                    let data = [];
                    results.forEach(function (elem) {
                        data.push({
                            enableExam:elem.enableExam,
                            id: elem.id,
                            name: elem.name,
                            month: elem.month,
                            passquestion: elem.passquestion,
                            questions: JSON.parse(elem.questions)
                        });
                    });
                    return res.json(
                        {
                            code: 200,
                            message: 'success',
                            data: {
                                months: monthCount,
                                exams: data
                            }
                        }
                    );
                }

            });
        }

    });
});


app.post('/user/verify', function (req, res) {
    pool.getConnection((err, connection) => {
        if (err) {
            return res.json(
                {
                    code: 505,
                    message: err
                }
            );
        } else {
            var requestBody = req.body;
            if (requestBody == null || (requestBody != null && requestBody.password == null || requestBody.user == null)) {
                return res.json(
                    {
                        error: 'Mandatory params missing  either user | password '
                    }
                );
            }
            connection.query(GET_USER, [requestBody.user, requestBody.password], function (err, results, fields) {
                if (err) {
                    return res.json(
                        {
                            code: 501,
                            message: err
                        }
                    );
                } else {

                    return res.json(
                        {
                            code: 200,
                            message: 'success',
                            data: results
                        }
                    );
                }

            });
        }

    });
});


app.post('/user/save', function (req, res) {
    pool.getConnection((err, connection) => {
        if (err) {
            return res.json(
                {
                    code: 505,
                    message: err
                }
            );
        } else {
            let randomToken = randomTextGenerator.generate();
            var requestBody = req.body;
            if (requestBody == null || (requestBody != null && requestBody.password == null || requestBody.user == null)) {
                return res.json(
                    {
                        error: 'Mandatory params missing  either user | password '
                    }
                );
            }
            connection.query(SAVE_USER, [requestBody.user, requestBody.password, randomToken, requestBody.school], function (err, results, fields) {
                if (err) {
                    return res.json(
                        {
                            code: 501,
                            message: err
                        }
                    );
                } else {

                    return res.json(
                        {
                            data: {
                                code: 200,
                                message: 'success',
                                token: randomToken
                            }
                        }
                    );
                }

            });
        }

    });
});

app.post('/user/update', function (req, res) {
    pool.getConnection((err, connection) => {
        if (err) {
            return res.json(
                {
                    code: 505,
                    message: err
                }
            );
        } else {
            var requestBody = req.body;
            if (requestBody == null || (requestBody != null && requestBody.password == null || requestBody.user == null || requestBody.token == null)) {
                return res.json(
                    {
                        error: 'Mandatory params missing  either user | password | token'
                    }
                );
            }
            connection.query(UPDATE_USER, [requestBody.password, requestBody.school, requestBody.user, requestBody.token], function (err, results, fields) {
                if (err) {
                    return res.json(
                        {
                            message: err
                        }
                    );
                } else {

                    return res.json(
                        {
                            data: {
                                code: 200,
                                message: 'success',
                                token: requestBody.token
                            }
                        }
                    );
                }

            });
        }

    });
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server Started | 4000')

}); 