import React, { useEffect, useContext } from 'react';
import AppContext from '../AppContext';
import $ from 'jquery';


let userScrolled = false;

const waitPreviousProcessToExit = new Promise((res, _) => {
  window.api.receiveClose("get_container_logs", res);
})

const LogView = () => {
  const { containerId } = useContext(AppContext);

  useEffect(() => {
    window.api.kill("get_container_logs");
    if (!containerId) return;
    waitPreviousProcessToExit.then(() => {
      document.getElementById('logView').innerHTML = '';
      window.api.send("get_container_logs", { "container_id": containerId });
    })
  }, [containerId])

  useEffect(() => {
    const logViewElement = $("#logView");
    const logViewDiv = $("#logViewDiv");
    logViewElement.on('scroll', () => {
      userScrolled = logViewElement[0].scrollHeight - logViewElement[0].scrollTop !== logViewElement[0].clientHeight
    });
    window.api.receive("get_container_logs", (resp) => {
      logViewElement.append(resp);
      if (!userScrolled) {
        logViewDiv[0].scrollTop = logViewDiv[0].scrollHeight
      }
    });
  }, [])

  return <>
    <div id='logViewDiv' style={{
      maxHeight: '95%',
      overflow: 'auto'
    }}>
      <pre id='logView' />
    </div>
    <footer style={{
      height: '5%',
    }}>
      <h5>{`Full logs: $ docker logs --follow `} <i>{containerId}</i></h5>
    </footer>
  </>
}

export default LogView;