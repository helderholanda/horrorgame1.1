let questions=[], assets={}, sounds=[];
let currentQuestion=0, score=0, round=1, roundWins=0, unusedQuestions=[], questionDeck=[], timerInterval=null;
const totalRounds=3, roundTarget=6;

// DOM
let startBtn=document.getElementById("startBtn");
let startGifImg=document.getElementById("startGifImg");
let quizContainer=document.getElementById("quizContainer");
let questionText=document.getElementById("questionText");
let totalQuestionsP=document.getElementById("totalQuestions");
let optionsDiv=document.getElementById("options");
let questionGif=document.getElementById("questionGif");
let roundCounter=document.getElementById("roundCounter");
let timerContainer=document.getElementById("timerContainer");
let timerFill=document.getElementById("timerFill");

let bgMusic, soundStart, soundClick, soundLaugh;

// ======== FUNÇÕES ========
function shuffleArray(array){for(let i=array.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[array[i],array[j]]=[array[j],array[i]];}return array;}

function createShuffledDeck(){
    if(unusedQuestions.length<10) unusedQuestions=shuffleArray([...questions]);
    questionDeck=unusedQuestions.slice(0,10);
    unusedQuestions=unusedQuestions.slice(10);
}

function updateRoundCounter(){ roundCounter.textContent=`Rodada ${round} de ${totalRounds}`; }

function startTimer(){
    timerContainer.style.display="block";
    let time=0;
    timerFill.style.height='0%';
    timerInterval=setInterval(()=>{
        time++;
        timerFill.style.height=`${(time/20)*100}%`;
        if(time>=20){clearInterval(timerInterval);currentQuestion++;showQuestion();}
    },1000);
}

function showQuestion(){
    clearInterval(timerInterval);
    if(currentQuestion>=questionDeck.length){ showRoundResult(); return; }
    const q=questions[currentQuestion];
    questionText.textContent=q.text;
    totalQuestionsP.textContent=`Pergunta ${currentQuestion+1} de ${questionDeck.length}`;
    optionsDiv.innerHTML="";
    let opts=q.options.map((o,i)=>({o,i}));
    opts=shuffleArray(opts);
    opts.forEach(item=>{
        const btn=document.createElement("button");
        btn.textContent=item.o;
        btn.className="btn";
        btn.addEventListener("click",()=>{soundClick.play(); checkAnswer(item.i);});
        optionsDiv.appendChild(btn);
    });
    const gifKeys=Object.keys(assets).filter(k=>k.includes("scary"));
    questionGif.src=assets[gifKeys[currentQuestion%gifKeys.length]];
    startTimer();
}

function checkAnswer(selected){
    clearInterval(timerInterval);
    if(selected===questionDeck[currentQuestion].correct) score++;
    currentQuestion++;
    showQuestion();
}

function showRoundResult(){
    clearInterval(timerInterval);
    timerContainer.style.display="none";
    optionsDiv.innerHTML="";
    soundLaugh.play();
    const roundWon = score>=roundTarget;
    if(roundWon) roundWins++;
    questionText.innerHTML=`Rodada ${round} concluída! Acertos: ${score} / Erros: ${questionDeck.length-score}<br>Você ${roundWon?'ganhou':'perdeu'} esta rodada!`;
    totalQuestionsP.textContent="";
    questionGif.src=roundWon?assets["round_win.gif"]:assets["round_lose.gif"];

    const nextBtn=document.createElement("button"); nextBtn.className="btn";
    if(round===totalRounds){nextBtn.textContent="Ver Resultado"; nextBtn.onclick=showGameResult;}
    else{nextBtn.textContent="Próxima Rodada"; nextBtn.onclick=()=>{
        round++; currentQuestion=0; score=0;
        createShuffledDeck(); updateRoundCounter(); showQuestion();
    }};
    optionsDiv.appendChild(nextBtn);

    const quitBtn=document.createElement("button"); quitBtn.textContent="Sou um bebê chorão, desisto"; quitBtn.className="btn"; quitBtn.onclick=showGameResult;
    optionsDiv.appendChild(quitBtn);
}

function showGameResult(){
    optionsDiv.innerHTML="";
    roundCounter.textContent="";
    questionGif.src=assets["final.gif"];
    questionText.innerHTML=`Fim do jogo! Você venceu ${roundWins} de ${totalRounds} rodadas.`;
    const restartBtn=document.createElement("button"); restartBtn.textContent="Jogar Novamente"; restartBtn.className="btn"; restartBtn.onclick=restartGame;
    optionsDiv.appendChild(restartBtn);
}

function restartGame(){
    round=1; roundWins=0; currentQuestion=0; score=0;
    optionsDiv.innerHTML=""; questionText.textContent=""; questionGif.src="";
    unusedQuestions=shuffleArray([...questions]);
    createShuffledDeck(); updateRoundCounter(); showQuestion();
}

// ======== CARREGAR JSONS ========
async function loadJSON(url){ const res=await fetch(url); return await res.json(); }

async function initGame(){
    [questions, assets, sounds]=await Promise.all([
        loadJSON("questions.json"),
        loadJSON("assets.json"),
        loadJSON("sounds.json")
    ]);

    startGifImg.src=assets["start.gif"];

    bgMusic=new Audio(sounds["bgMusic.mp3"]); bgMusic.loop=true; bgMusic.volume=1.0;
    soundStart=new Audio(sounds["start.mp3"]);
    soundClick=new Audio(sounds["click.mp3"]);
    soundLaugh=new Audio(sounds["laugh.mp3"]);

    startBtn.onclick=()=>{
        soundStart.play();
        startBtn.style.display="none"; startGifImg.style.display="none";
        quizContainer.style.display="flex";
        unusedQuestions=shuffleArray([...questions]);
        createShuffledDeck(); updateRoundCounter(); showQuestion();
        bgMusic.play().catch(()=>console.log("Clique no botão para iniciar a música de fundo."));
    };
}

window.addEventListener("load", initGame);
