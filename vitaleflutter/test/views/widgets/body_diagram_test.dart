import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:vitaleflutter/models/symptom_area.dart';
import 'package:vitaleflutter/views/widgets/body_diagram.dart';

void main() {
  testWidgets('tapping a front marker selects its body region', (tester) async {
    SymptomArea? tappedArea;

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Center(
            child: SizedBox(
              width: 300,
              child: BodyDiagram(
                showBack: false,
                selectedAreas: const {},
                onAreaTap: (area) => tappedArea = area,
              ),
            ),
          ),
        ),
      ),
    );

    final diagramRect = tester.getRect(find.byType(BodyDiagram));
    await tester.tapAt(
      diagramRect.topLeft +
          Offset(diagramRect.width * 0.5, diagramRect.height * 0.37),
    );

    expect(tappedArea?.id, 'chest');
  });

  testWidgets('the back view exposes the back region marker', (tester) async {
    SymptomArea? tappedArea;

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Center(
            child: SizedBox(
              width: 300,
              child: BodyDiagram(
                showBack: true,
                selectedAreas: const {},
                onAreaTap: (area) => tappedArea = area,
              ),
            ),
          ),
        ),
      ),
    );

    final diagramRect = tester.getRect(find.byType(BodyDiagram));
    await tester.tapAt(
      diagramRect.topLeft +
          Offset(diagramRect.width * 0.5, diagramRect.height * 0.4),
    );

    expect(tappedArea?.id, 'back');
  });
}
