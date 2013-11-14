
// Adjust the difficulty with this.
var maxNumberSize = 25;
var maxQuestionTime = 30;
var maxQuestions = 25;

var Quiz = function (mode) {
    var self = this;
        
    self.currentAnswer = ko.observable("");
    self.currentQuestionIndex = ko.observable(0);    
    self.questions = ko.observableArray([]);
    self.quizRunning = ko.observable(false);
    self.quizOver = ko.observable(false);
    self.showIntro = ko.observable(true);
    self.score = ko.observable(0);
    self.timeRemaining = ko.observable(maxQuestionTime);

    self.currentQuestion = ko.computed(function () {
        var question = self.questions()[self.currentQuestionIndex()];                                
        return question.firstNumber() + " "
                    + self.getOperator(question.operator) + " "
                    + question.secondNumber() + " =";
    }, self, { deferEvaluation: true });

    self.countdownClass = ko.computed(function () {
        var remaining = self.percentRemaining();
        return remaining > 45
                ? "progress-bar progress-bar-success"
                : remaining > 25 && remaining <= 45
                    ? "progress-bar progress-bar-warning"
                    : "progress-bar progress-bar-danger"
    }, self, { deferEvaluation: true });
    
    self.generateQuestions = function (mode, count) {
        var createQuestion = function (mode) {
            var first = 0, second = 0, answer = 0;
            if (mode == "/") {
                // Hack to keep trying random values until two whole numbers come up
                while (true) {
                    first = Math.floor(Math.random() * (maxNumberSize - 1)) + 1;
                    second = Math.floor(Math.random() * (maxNumberSize - 1)) + 1;
                    answer = eval(first + mode + second);

                    if (eval(first + "%" + second) == 0) {
                        break;
                    }
                }
            }
            else if (mode == "-") {
                // Prevent negative numbers as answers by making second be less or equal to first.
                first = Math.floor(Math.random() * (maxNumberSize - 1)) + 1;
                second = Math.floor(Math.random() * (first - 1)) + 1;
                answer = eval(first + mode + second);
            }
            else {
                first = Math.floor(Math.random() * (maxNumberSize - 1)) + 1;
                second = Math.floor(Math.random() * (maxNumberSize - 1)) + 1;
                answer = eval(first + mode + second);
            }

            return {
                firstNumber: ko.observable(first),
                operator: ko.observable(mode),
                secondNumber: ko.observable(second),
                answer: ko.observable(answer),
                userAnswer: ko.observable("")
            };
        };

        var questions = [];
        var modes = ["+", "-", "*", "/"];
        for (var i = 0; i < count; i++) {
            var actualMode = mode;
            if (mode == "all") {
                actualMode = modes[Math.floor(Math.random() * 4)];
            }
            questions.push(createQuestion(actualMode));
        }

        return questions;
    };

    self.getOperator = function (operator) {        
        return operator() == "*" ? "x"
            : operator() == "/" ? "÷"
            : operator();
    };

    self.grade = ko.computed(function () {
        if (self.score() == 0) {
            return "F";
        }

        var percent = self.score() / maxQuestions * 100;
        return percent > 97 ? "A+"
                : percent > 94 ? "A"
                : percent > 90 ? "A-"
                : percent > 87 ? "B+"
                : percent > 83 ? "B"
                : percent > 80 ? "B-"
                : percent > 77 ? "C+"
                : percent > 73 ? "C"
                : percent > 70 ? "C-"
                : percent > 67 ? "D+"
                : percent > 63 ? "D"
                : percent > 60 ? "D"
                : "F";
    }, self, { deferEvaluation: true });

    self.headingText = ko.computed(function() {
        return mode == "+" ? "Addition Quiz"
                : mode == "-" ? "Subtraction Quiz"
                : mode == "*" ? "Multiplication Quiz"
                : mode ==  "/" ? "Division Quiz"
                : mode = "Math Quiz";
    }, self, { deferEvaluation: true });

    self.lostFocus = function (data, event) {        
        $(event.currentTarget).focus();
    };

    self.percentRemaining = ko.computed(function () {
        return self.timeRemaining() / maxQuestionTime * 100;
    }, self, { deferEvaluation: true });
    
    self.maxQuizTime = ko.computed(function () {
        return (maxQuestionTime * maxQuestions / 60) + " minutes"
    });

    // Next Question Button / Timer Expired
    self.nextQuestion = function () {
        var question = self.questions()[self.currentQuestionIndex()];
        question.userAnswer(self.currentAnswer());
        self.currentAnswer("");

        if (question.userAnswer() == question.answer()) {
            self.score(self.score() + 1);
        }

        if (self.currentQuestionIndex() < self.questions().length - 1) {
            self.timeRemaining(maxQuestionTime);
            self.currentQuestionIndex(self.currentQuestionIndex() + 1);
        }
        else {
            clearInterval(self.intervalTimer);
            self.quizRunning(false);
            self.quizOver(true);
        }
    };

    // Called on the Try Again button
    self.tryAgain = function () {
        self.reset();
        self.start();
    };

    // Inits the Quiz
    self.reset = function () {
        self.questions(self.generateQuestions(mode, maxQuestions));
        self.score(0);
        self.currentQuestionIndex(0);
        self.timeRemaining(maxQuestionTime);
        self.currentAnswer("");        
    };

    // Starts the quiz
    self.start = function () {
        self.quizRunning(true);        
        self.showIntro(false);
        self.intervalTimer = setInterval(function () {
            self.timeRemaining(self.timeRemaining() - 1);

            if (self.timeRemaining() <= 0) {
                self.nextQuestion();
            }
        }, 1000);
    };

    // Prep the quiz    
    self.reset();
};

var qs = window.location.search;
var quizMode = qs == "?mode=add" ? "+"
        : qs == "?mode=sub" ? "-"
        : qs == "?mode=multiply" ? "*"
        : qs == "?mode=divide" ? "/"
        : qs == "?mode=all" ? "all"
        : "+";

ko.applyBindings(new Quiz(quizMode));