import 'package:firebase_auth/firebase_auth.dart';
import 'package:material_ui/material_ui.dart';
import 'package:flutter/services.dart';

import '../app/app_routes.dart';
import '../controllers/auth_controller.dart';
import '../controllers/registration_controller.dart';
import 'widgets/vitale_brand.dart';

class RegistrationScreen extends StatefulWidget {
  const RegistrationScreen({this.initialEmail, super.key});

  final String? initialEmail;

  @override
  State<RegistrationScreen> createState() => _RegistrationScreenState();
}

class _RegistrationScreenState extends State<RegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _controller = RegistrationController();
  final _authController = AuthController();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _contactNameController = TextEditingController();
  final _phoneController = TextEditingController();
  String _relationship = 'Filha(o)';
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _emailController.text = widget.initialEmail ?? '';
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _contactNameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final profile = _controller.createProfile(
      name: _nameController.text,
      emergencyContactName: _contactNameController.text,
      emergencyPhone: _phoneController.text,
      relationship: _relationship,
    );

    setState(() => _isSubmitting = true);
    try {
      await _authController.register(
        email: _emailController.text,
        password: _passwordController.text,
        profile: profile,
      );
      if (!mounted) {
        return;
      }

      Navigator.pushNamedAndRemoveUntil(
        context,
        AppRoutes.symptoms,
        (route) => false,
        arguments: profile,
      );
    } on FirebaseAuthException catch (error) {
      _showMessage(authErrorMessage(error));
    } on FirebaseException catch (error) {
      _showMessage(
        'A conta foi autenticada, mas o perfil não foi salvo '
        '(erro: ${error.code}). Verifique a conexão e as regras do Firestore '
        'e tente novamente.',
      );
    } on StateError catch (error) {
      _showMessage(error.message);
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));
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
                        'Sua conta será protegida pelo Firebase Authentication.',
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
                        controller: _emailController,
                        label: 'E-mail',
                        hint: 'seu@email.com',
                        icon: Icons.email_outlined,
                        keyboardType: TextInputType.emailAddress,
                        validator: _controller.validateEmail,
                        autofillHints: const [AutofillHints.newUsername],
                      ),
                      const SizedBox(height: 16),
                      _buildTextField(
                        controller: _passwordController,
                        label: 'Senha',
                        hint: 'Pelo menos 8 caracteres',
                        icon: Icons.lock_outline,
                        validator: _controller.validatePassword,
                        obscureText: true,
                        autofillHints: const [AutofillHints.newPassword],
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
                        onPressed: _isSubmitting ? null : _register,
                        icon: _isSubmitting
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Icon(Icons.arrow_forward),
                        label: Text(
                          _isSubmitting ? 'Salvando...' : 'Criar conta',
                        ),
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
                    'O contato de emergência ficará no seu perfil e só poderá '
                    'ser lido pela sua conta.',
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
    bool obscureText = false,
    Iterable<String>? autofillHints,
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
      obscureText: obscureText,
      autofillHints: autofillHints,
      textInputAction: TextInputAction.next,
      validator: validator,
    );
  }
}
