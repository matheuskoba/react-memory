import { useEffect, useState } from 'react';
import * as C from './App.styles';
import LogoImage from './assets/devmemory_logo.png';
import RestartIcon from './svgs/restart.svg';
import { InfoItem } from './components/InfoItem';
import { Button } from './components/Button';
import { GridItemType } from './types/GridItemType';
import { items } from './data/items';
import { GridItem } from './components/GridItem';
import { formatTimeElapsed } from './helpers/formatTimeElapsed';

const App = () => {
  const [playing, setPlaying] = useState<boolean>(false);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [shownCount, setShownCount] = useState<number>(0);
  const [gridItems, setGridItems] = useState<GridItemType[]>([]);

  useEffect(() => resetAndCreateGrid(), []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (playing) setTimeElapsed(timeElapsed + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [playing, timeElapsed])

  //verificar se as cartas abertas sao iguais
  useEffect(() => {
    if(shownCount === 2){

      let opened = gridItems.filter(item => item.shown)

      if (opened.length === 2){

        if(opened[0].item === opened[1].item){
          //verificacao 1 - se eles sao iguais torna-los permanentes
          let tmpGrid = [...gridItems];        
          for(let i in tmpGrid){
            if(tmpGrid[i].shown){
              tmpGrid[i].permanentShown = true;
              tmpGrid[i].shown = false;
            }
          }
          setGridItems(tmpGrid);
          setShownCount(0);

        }else{
          //v2 - se eles nao sao iguais, fecha eles
          setTimeout(() => {
            let tmpGrid = [...gridItems];
            for(let i in tmpGrid){
              tmpGrid[i].shown = false;
            }
            setGridItems(tmpGrid);
            setShownCount(0);
          }, 1000);
        }

        setMoveCount(moveCount => moveCount + 1);
      }
    }
  }, [shownCount, gridItems])

  //verificar se o jogo acabou
  useEffect(() => {
    if(moveCount > 0 && gridItems.every(item => item.permanentShown)){
      setPlaying(false);
    }
  }, [moveCount, gridItems]);

  const resetAndCreateGrid = () => {
    //Passo 1 - resetar o jogo
    setTimeElapsed(0);
    setMoveCount(0);
    setShownCount(0);
    //Passo 2 - criar a grid
    //2.1 - criar a grid vazia
    let tmpGrid: GridItemType[] = [];
    for(let i = 0; i < (items.length * 2); i++){
      tmpGrid.push({
        item: null,
        shown: false,
        permanentShown: false
      });
    }
    //2.2 - preencher a grid vazia
    for(let w = 0; w < 2; w++){
      for(let i = 0; i < items.length; i++){
        let pos = -1;
        while(pos < 0 || tmpGrid[pos].item !== null){
          pos = Math.floor(Math.random() * (items.length * 2));
        }
        tmpGrid[pos].item = i;
      }
    }
    //2.3 - jogar no state
    setGridItems(tmpGrid);
    //Passo 3 - comecar o jogo
    setPlaying(true);
  }

  const handleItemClick = (index:number) => {
    if(playing && index !== null && shownCount < 2){
      let tmpGrid = [...gridItems];

      if(!tmpGrid[index].permanentShown && !tmpGrid[index].shown) {
        tmpGrid[index].shown = true;
        setShownCount(shownCount + 1);
      }

      setGridItems(tmpGrid);
    }
  }

  return(
      <C.Container>
        <C.Info>
          <C.LogoLink href="">
            <img src={LogoImage} width={200} alt='' />
          </C.LogoLink>

          <C.InfoArea>
            <InfoItem label='Tempo' value={formatTimeElapsed(timeElapsed)}/>
            <InfoItem label='Movimentos' value={moveCount.toString()}/>
          </C.InfoArea>
          
          <Button label='Reiniciar' onClick={resetAndCreateGrid} icon={RestartIcon}/>
        </C.Info>
        <C.GridArea>
          <C.Grid>
            {gridItems.map((item, index) => (
               <GridItem key={index} item={item} onClick={() => handleItemClick(index)}/>
            ))}
          </C.Grid>
        </C.GridArea>
      </C.Container>
  );
}

export default App;