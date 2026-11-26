import 'dart:math' as math;

import 'package:material_ui/material_ui.dart';

import '../../app/vitale_theme.dart';
import '../../models/symptom_area.dart';

class BodyDiagram extends StatelessWidget {
  const BodyDiagram({
    required this.showBack,
    required this.selectedAreas,
    required this.onAreaTap,
    super.key,
  });

  final bool showBack;
  final Set<SymptomArea> selectedAreas;
  final ValueChanged<SymptomArea> onAreaTap;

  static const _markers = <_BodyMarker>[
    _BodyMarker('head', 0.50, 0.12, bothSides: true),
    _BodyMarker('eyes', 0.50, 0.19),
    _BodyMarker('throat', 0.50, 0.27),
    _BodyMarker('chest', 0.50, 0.37),
    _BodyMarker('stomach', 0.50, 0.48),
    _BodyMarker('back', 0.50, 0.40, backOnly: true),
    _BodyMarker('arms', 0.28, 0.40, bothSides: true),
    _BodyMarker('arms', 0.72, 0.40, bothSides: true),
    _BodyMarker('legs', 0.42, 0.72, bothSides: true),
    _BodyMarker('legs', 0.58, 0.72, bothSides: true),
    _BodyMarker('feet', 0.39, 0.94, bothSides: true),
    _BodyMarker('feet', 0.61, 0.94, bothSides: true),
  ];

  List<_BodyMarker> get _visibleMarkers => _markers.where((marker) {
    if (marker.backOnly && !showBack) {
      return false;
    }
    if (!showBack && marker.areaId == 'back') {
      return false;
    }
    if (showBack && !marker.bothSides && !marker.backOnly) {
      return false;
    }
    return true;
  }).toList();

  SymptomArea _areaFor(_BodyMarker marker) =>
      SymptomArea.all.firstWhere((area) => area.id == marker.areaId);

  void _handleTap(TapUpDetails details, Size size) {
    final tapX = details.localPosition.dx / size.width;
    final tapY = details.localPosition.dy / size.height;
    _BodyMarker? closestMarker;
    var closestDistance = double.infinity;
    for (final marker in _visibleMarkers) {
      final dx = (tapX - marker.x) * size.width;
      final dy = (tapY - marker.y) * size.height;
      final distance = math.sqrt(dx * dx + dy * dy);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestMarker = marker;
      }
    }
    if (closestMarker != null && closestDistance <= 38) {
      onAreaTap(_areaFor(closestMarker));
    }
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        final height = width * 1.4;
        return SizedBox(
          width: width,
          height: height,
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTapUp: (details) => _handleTap(details, Size(width, height)),
            child: Stack(
              children: [
                Positioned.fill(
                  child: CustomPaint(
                    painter: _BodyPainter(
                      showBack: showBack,
                      selectedAreaIds: selectedAreas
                          .map((area) => area.id)
                          .toSet(),
                      markers: _visibleMarkers,
                    ),
                  ),
                ),
                for (final marker in _visibleMarkers)
                  Positioned(
                    left: width * marker.x - 24,
                    top: height * marker.y - 24,
                    width: 48,
                    height: 48,
                    child: Tooltip(
                      message: _areaFor(marker).name,
                      child: Semantics(
                        button: true,
                        label: 'Sinalizar ${_areaFor(marker).name}',
                        selected: selectedAreas.contains(_areaFor(marker)),
                        child: IconButton(
                          onPressed: () => onAreaTap(_areaFor(marker)),
                          padding: EdgeInsets.zero,
                          icon: const SizedBox.shrink(),
                        ),
                      ),
                    ),
                  ),
                Positioned(
                  bottom: 4,
                  left: 0,
                  right: 0,
                  child: Text(
                    showBack ? 'COSTAS' : 'FRENTE',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Color(0xFF77716D),
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.2,
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _BodyMarker {
  const _BodyMarker(
    this.areaId,
    this.x,
    this.y, {
    this.bothSides = false,
    this.backOnly = false,
  });

  final String areaId;
  final double x;
  final double y;
  final bool bothSides;
  final bool backOnly;
}

class _BodyPainter extends CustomPainter {
  const _BodyPainter({
    required this.showBack,
    required this.selectedAreaIds,
    required this.markers,
  });

  final bool showBack;
  final Set<String> selectedAreaIds;
  final List<_BodyMarker> markers;

  static const _designSize = Size(300, 420);

  @override
  void paint(Canvas canvas, Size size) {
    canvas.save();
    canvas.scale(
      size.width / _designSize.width,
      size.height / _designSize.height,
    );

    final fill = Paint()
      ..color = const Color(0xFFD8D4D1)
      ..style = PaintingStyle.fill;
    final edge = Paint()
      ..color = const Color(0xFFBEB9B5)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    final limbs = Paint()
      ..color = const Color(0xFFD8D4D1)
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 25;

    canvas.drawCircle(const Offset(150, 48), 28, fill);
    canvas.drawCircle(const Offset(150, 48), 28, edge);
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        const Rect.fromLTRB(136, 70, 164, 103),
        const Radius.circular(10),
      ),
      fill,
    );

    final torso = Path()
      ..moveTo(137, 92)
      ..quadraticBezierTo(119, 94, 105, 108)
      ..lineTo(94, 155)
      ..lineTo(108, 204)
      ..quadraticBezierTo(112, 218, 125, 222)
      ..lineTo(175, 222)
      ..quadraticBezierTo(188, 218, 192, 204)
      ..lineTo(206, 155)
      ..lineTo(195, 108)
      ..quadraticBezierTo(181, 94, 163, 92)
      ..close();
    canvas.drawPath(torso, fill);
    canvas.drawPath(torso, edge);

    final arms = Path()
      ..moveTo(108, 113)
      ..lineTo(87, 169)
      ..lineTo(76, 222)
      ..moveTo(192, 113)
      ..lineTo(213, 169)
      ..lineTo(224, 222);
    canvas.drawPath(arms, limbs);

    final legs = Path()
      ..moveTo(136, 212)
      ..lineTo(132, 295)
      ..lineTo(128, 371)
      ..moveTo(164, 212)
      ..lineTo(168, 295)
      ..lineTo(172, 371);
    final legPaint = Paint()
      ..color = const Color(0xFFD8D4D1)
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 31;
    canvas.drawPath(legs, legPaint);
    canvas.drawPath(legs, edge..strokeWidth = 1.5);

    final handsAndFeet = Paint()
      ..color = const Color(0xFFD8D4D1)
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 20;
    canvas.drawLine(const Offset(76, 222), const Offset(73, 235), handsAndFeet);
    canvas.drawLine(
      const Offset(224, 222),
      const Offset(227, 235),
      handsAndFeet,
    );
    canvas.drawLine(
      const Offset(128, 371),
      const Offset(119, 385),
      handsAndFeet,
    );
    canvas.drawLine(
      const Offset(172, 371),
      const Offset(181, 385),
      handsAndFeet,
    );

    final detail = Paint()
      ..color = const Color(0xFFB8B2AE)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;
    if (showBack) {
      canvas.drawLine(const Offset(150, 108), const Offset(150, 207), detail);
      canvas.drawLine(const Offset(124, 120), const Offset(145, 145), detail);
      canvas.drawLine(const Offset(176, 120), const Offset(155, 145), detail);
    } else {
      final clavicle = Path()
        ..moveTo(115, 112)
        ..quadraticBezierTo(134, 123, 150, 116)
        ..quadraticBezierTo(166, 123, 185, 112);
      canvas.drawPath(clavicle, detail);
    }

    for (final marker in markers) {
      final selected = selectedAreaIds.contains(marker.areaId);
      final center = Offset(
        marker.x * _designSize.width,
        marker.y * _designSize.height,
      );
      canvas.drawCircle(
        center,
        selected ? 15 : 13,
        Paint()
          ..color = selected
              ? VitaleTheme.primary.withValues(alpha: 0.22)
              : Colors.white.withValues(alpha: 0.78),
      );
      canvas.drawCircle(
        center,
        selected ? 9 : 7,
        Paint()..color = selected ? VitaleTheme.primary : Colors.white,
      );
      canvas.drawCircle(
        center,
        selected ? 9 : 7,
        Paint()
          ..color = VitaleTheme.primary
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2,
      );
    }

    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant _BodyPainter oldDelegate) =>
      showBack != oldDelegate.showBack ||
      selectedAreaIds != oldDelegate.selectedAreaIds;
}
