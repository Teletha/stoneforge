/*
 * Copyright (C) 2019 Nameless Production Committee
 *
 * Licensed under the MIT License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *          http://opensource.org/licenses/mit-license.php
 */
package stoneforge.javadoc;

import javax.lang.model.element.Modifier;

import kiss.I;
import kiss.XML;
import stoneforge.javadoc.analyze.ClassInfo;
import stylist.Style;
import stylist.StyleDSL;
import stylist.value.Numeric;

public class DocumentPage extends Page {

    /**
     * @param model
     * @param info
     */
    public DocumentPage(JavadocModel model, ClassInfo info) {
        super(model, info);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    protected void declareContents() {
        if (info.hasDocument()) {
            $("section", Styles.Section, Styles.JavadocComment, () -> {
                write(info);
            });
        }

        for (ClassInfo child : info.children(Modifier.PUBLIC)) {
            if (child.hasDocument()) {
                $("section", attr("id", child.id()), Styles.Section, Styles.JavadocComment, () -> {
                    write(child);

                    for (ClassInfo foot : child.children(Modifier.PUBLIC)) {
                        if (foot.hasDocument()) {
                            $("section", attr("id", foot.id()), Styles.JavadocComment, styles.foot, () -> {
                                write(foot);
                            });
                        }
                    }
                });
            }
        }
    }

    private void write(ClassInfo info) {
        XML doc = info.createComment();
        XML heading = doc.find("h,h1,h2,h3,h4,h5,h6,h7").first().remove();

        $("header", Styles.JavadocComment, styles.header, () -> {
            $(xml(heading.size() != 0 ? heading : I.xml("h2").text(info.title())));
            $("div", styles.meta, () -> {
                $("a", attr("class", "perp"), styles.icon, () -> {
                    $("svg", attr("viewBox", "0 0 24 24"), styles.svg, () -> {
                        $("use", attr("href", "/main.svg#link"));
                    });
                });

                $("a", attr("class", "tweet"), styles.icon, () -> {
                    $("svg", attr("viewBox", "0 0 24 24"), styles.svg, () -> {
                        $("use", attr("href", "/main.svg#twitter"));
                    });
                });

                String editor = model.editor().apply(info.filePath(), info.documentLine());
                if (editor != null) {
                    $("a", attr("href", editor), attr("class", "edit"), styles.icon, () -> {
                        $("svg", attr("viewBox", "0 0 24 24"), styles.svg, () -> {
                            $("use", attr("href", "/main.svg#edit"));
                        });
                    });
                }
            });
        });
        $(xml(doc));
    }

    /**
     * {@inheritDoc}
     */
    @Override
    protected void declareSubNavigation() {
    }

    interface styles extends StyleDSL, StyleConstants {

        Numeric IconSize = Numeric.of(14, px);

        Style header = () -> {
            position.relative();
        };

        Style meta = () -> {
            position.absolute().top(Numeric.of(50, percent).subtract(IconSize.divide(2))).right(IconSize.divide(2));
        };

        Style icon = () -> {
            display.inlineBlock().width(IconSize).height(IconSize);
            font.lineHeight(1);
            margin.left(IconSize);
        };

        Style svg = Styles.SVG.with(() -> {
            stroke.width(2.5, px).color(theme.front.opacify(-0.6));

            $.transit().duration(0.5, s).when().hover(() -> {
                stroke.color(theme.accent);
            });

            $.transit().duration(0.05, s).ease().when().active(() -> {
                transform.translateY(3, px);
            });
        });

        Style foot = () -> {
            margin.top(3, em);
        };
    }
}
