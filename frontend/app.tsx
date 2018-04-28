import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";

import { store } from "@frontend/app-state";
import "./extensions";

import { Chord } from "./ui/chord";
import { ControlGroup } from "./ui/control-group";
import { NodeSelector } from "./ui/NodeSelector";
import { NodeDetails } from "./ui/node-details";


ReactDOM.render(
    <Provider store={ store }>
        <div className="main-layout">
            <header className="main-header main-layout__header">
                <a className="logo"><b>HiSoc</b> VIS</a>
                <nav className="navbar navbar-static-top"/>
            </header>
            <main className="content-wrapper main-layout__content sidebar-layout">
                <aside className="main-sidebar sidebar-layout__sidebar">
                    <form className="sidebar-form">
                        <NodeSelector/>
                        <ControlGroup/>
                    </form>
                </aside>
                <section className="content chart-container sidebar-layout__content">
                    <Chord/>
                    <NodeDetails/>
                </section>
            </main>
        </div>
    </Provider>,
    document.getElementById("app")
);
