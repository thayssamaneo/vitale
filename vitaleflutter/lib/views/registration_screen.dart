import 'package:material_ui/material_ui.dart';
import 'package:flutter/services.dart';

import '../app/app_routes.dart';
import '../controllers/registration_controller.dart';
import 'widgets/vitale_brand.dart';

class RegistrationScreen extends StatefulWidget {
  const RegistrationScreen({super.key});

  @override
  State<RegistrationScreen> createState() => _RegistrationScreenState();
}

class _RegistrationScreenState extends State<RegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _controller = RegistrationController();
  final _nameController = TextEditingController();
  final _contactNameController = TextEditingController();
  final _phoneController = TextEditingController();
  String _relationship = 'Filha(o)';

  @override
  void dispose() {
    _nameController.dispose();
    _contactNameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  void _continue() {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final profile = _controller.createProfile(
      name: _nameController.text,
      emergencyContactName: _contactNameController.text,
      emergencyPhone: _phoneController.text,
      relationship: _relationship,
    );

    Navigator.pushNamed(context, AppRoutes.symptoms, arguments: profile);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(22, 18, 22, 28),
          children: [
            const VitaleBrand(),
            const SizedBox(height: 30),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
              decoration: BoxDecoration(
                color: const Color(0xFFD8F4F0),
                borderRadius: BorderRadius.circular(30),
              ),
              child: const Text(
                'CUIDADO E SAÚDE',
                style: TextStyle(
                  color: Color(0xFF075E57),
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.6,
                ),
              ),
            ),
            const SizedBox(height: 18),
            Text(
              'Saúde integrada, humanizada e perto de você.',
              style: Theme.of(context).textTheme.headlineMedium
                  ?.copyWith(fontWeight: FontWeight.w800, height: 1.12),
            ),
            const SizedBox(height: 10),
            Text(
              'Vamos preparar seu acesso e cadastrar um contato de confiança.',
              style: Theme.of(context).textTheme.bodyLarge
                  ?.copyWith(color: const Color(0xFF5F5A56), height: 1.45),
            ),
            const SizedBox(height: 22),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        'Cadastro inicial',
                        style: Theme.of(context).textTheme.titleLarge
                            ?.copyWith(fontWeight: FontWeight.w800),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Protótipo: as informações ficam somente nesta sessão.',
                        style: TextStyle(color: Color(0xFF625D59)),
                      ),
                      const SizedBox(height: 20),
                      _buildTextField(
                        controller: _nameController,
                        label: 'Seu nome',
                        hint: 'Como podemos chamar você?',
                        icon: Icons.person_outline,
                        validator: _controller.validateName,
                      ),
                      const SizedBox(height: 16),
                      _buildTextField(
                        controller: _contactNameController,
                        label: 'Contato de emergência',
                        hint: 'Nome da pessoa de confiança',
                        icon: Icons.favorite_border,
                        validator: _controller.validateName,
                      ),
                      const SizedBox(height: 16),
                      DropdownButtonFormField<String>(
                        initialValue: _relationship,
                        decoration: const InputDecoration(
                          labelText: 'Parentesco',
                          prefixIcon: Icon(Icons.people_outline),
                        ),
                        items: const [
                          DropdownMenuItem(
                            value: 'Filha(o)',
                            child: Text('Filha(o)'),
                          ),
                          DropdownMenuItem(
                            value: 'Cônjuge',
                            child: Text('Cônjuge'),
                          ),
                          DropdownMenuItem(
                            value: 'Irmã(o)',
                            child: Text('Irmã(o)'),
                          ),
                          DropdownMenuItem(
                            value: 'Amiga(o)',
                            child: Text('Amiga(o)'),
                          ),
                          DropdownMenuItem(
                            value: 'Outro',
                            child: Text('Outro'),
                          ),
                        ],
                        onChanged: (value) {
                          if (value != null) {
                            setState(() => _relationship = value);
                          }
                        },
                      ),
                      const SizedBox(height: 16),
                      _buildTextField(
                        controller: _phoneController,
                        label: 'Telefone do contato',
                        hint: '(11) 98765-4321',
                        icon: Icons.phone_outlined,
                        keyboardType: TextInputType.phone,
                        inputFormatters: [
                          FilteringTextInputFormatter.allow(
                            RegExp(r'[0-9+\s()-]'),
                          ),
                        ],
                        validator: _controller.validatePhone,
                      ),
                      const SizedBox(height: 22),
                      FilledButton.icon(
                        onPressed: _continue,
                        icon: const Icon(Icons.arrow_forward),
                        label: const Text('Continuar'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 18),
            const Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.shield_outlined, color: Color(0xFF087F73)),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Seus dados de demonstração não são enviados nem salvos.',
                    style: TextStyle(color: Color(0xFF4D5C57), height: 1.4),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    String? Function(String?)? validator,
    TextInputType? keyboardType,
    List<TextInputFormatter>? inputFormatters,
  }) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: Icon(icon),
      ),
      keyboardType: keyboardType,
      inputFormatters: inputFormatters,
      textInputAction: TextInputAction.next,
      validator: validator,
    );
  }
}
